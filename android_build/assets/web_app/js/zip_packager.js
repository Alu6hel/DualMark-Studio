/**
 * DualMark Studio — Standalone Client-Side ZIP Packager
 * Pure JavaScript PKZIP binary generator for batch multi-SKU asset exports without external dependencies.
 */
(function(window) {
  'use strict';

  // CRC32 table generator
  var CRC32_TABLE = (function() {
    var c, table = [];
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      table[n] = c;
    }
    return table;
  })();

  function crc32(bytes) {
    var crc = 0 ^ (-1);
    for (var i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function strToUtf8(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
      }
    }
    return new Uint8Array(utf8);
  }

  function ZipPackager() {
    this.files = [];
  }

  ZipPackager.prototype = {
    addFile: function(filename, content) {
      var data;
      if (typeof content === 'string') {
        data = strToUtf8(content);
      } else if (content instanceof Uint8Array) {
        data = content;
      } else if (content instanceof ArrayBuffer) {
        data = new Uint8Array(content);
      } else {
        data = strToUtf8(String(content));
      }

      this.files.push({
        name: filename,
        data: data,
        crc: crc32(data),
        size: data.length
      });
    },

    buildZipBlob: function() {
      var fileHeaders = [];
      var centralDirs = [];
      var offset = 0;

      for (var i = 0; i < this.files.length; i++) {
        var file = this.files[i];
        var nameBytes = strToUtf8(file.name);

        // Local file header (30 bytes + name length + data length)
        var localHeader = new Uint8Array(30 + nameBytes.length);
        var view = new DataView(localHeader.buffer);

        view.setUint32(0, 0x04034b50, true);  // Local file header signature
        view.setUint16(4, 20, true);          // Version needed to extract (2.0)
        view.setUint16(6, 0, true);           // General purpose bit flag
        view.setUint16(8, 0, true);           // Compression method (0 = Store)
        view.setUint16(10, 0, true);          // Last mod file time
        view.setUint16(12, 0, true);          // Last mod file date
        view.setUint32(14, file.crc, true);   // CRC-32
        view.setUint32(18, file.size, true);  // Compressed size
        view.setUint32(22, file.size, true);  // Uncompressed size
        view.setUint16(26, nameBytes.length, true); // File name length
        view.setUint16(28, 0, true);          // Extra field length
        localHeader.set(nameBytes, 30);

        fileHeaders.push(localHeader);
        fileHeaders.push(file.data);

        // Central directory entry (46 bytes + name length)
        var centralDir = new Uint8Array(46 + nameBytes.length);
        var cdView = new DataView(centralDir.buffer);

        cdView.setUint32(0, 0x02014b50, true); // Central directory signature
        cdView.setUint16(4, 20, true);         // Version made by
        cdView.setUint16(6, 20, true);         // Version needed
        cdView.setUint16(8, 0, true);          // General purpose bit flag
        cdView.setUint16(10, 0, true);         // Compression method (Store)
        cdView.setUint16(12, 0, true);         // Mod time
        cdView.setUint16(14, 0, true);         // Mod date
        cdView.setUint32(16, file.crc, true);  // CRC-32
        cdView.setUint32(20, file.size, true); // Compressed size
        cdView.setUint32(24, file.size, true); // Uncompressed size
        cdView.setUint16(28, nameBytes.length, true);
        cdView.setUint16(30, 0, true);         // Extra field length
        cdView.setUint16(32, 0, true);         // Comment length
        cdView.setUint16(34, 0, true);         // Disk number start
        cdView.setUint16(36, 0, true);         // Internal file attributes
        cdView.setUint32(38, 0, true);         // External file attributes
        cdView.setUint32(42, offset, true);    // Relative offset of local header
        centralDir.set(nameBytes, 46);

        centralDirs.push(centralDir);
        offset += localHeader.length + file.data.length;
      }

      var centralDirOffset = offset;
      var centralDirSize = 0;
      for (var c = 0; c < centralDirs.length; c++) {
        centralDirSize += centralDirs[c].length;
      }

      // End of central directory record (22 bytes)
      var eocd = new Uint8Array(22);
      var eocdView = new DataView(eocd.buffer);
      eocdView.setUint32(0, 0x06054b50, true); // End of central dir signature
      eocdView.setUint16(4, 0, true);          // Number of this disk
      eocdView.setUint16(6, 0, true);          // Disk where central directory starts
      eocdView.setUint16(8, this.files.length, true);  // Total entries on disk
      eocdView.setUint16(10, this.files.length, true); // Total entries
      eocdView.setUint32(12, centralDirSize, true);    // Size of central directory
      eocdView.setUint32(16, centralDirOffset, true);  // Offset of central directory
      eocdView.setUint16(20, 0, true);         // Comment length

      var allParts = fileHeaders.concat(centralDirs).concat([eocd]);
      return new Blob(allParts, { type: 'application/zip' });
    }
  };

  window.DualMarkZip = {
    create: function() {
      return new ZipPackager();
    }
  };
})(window);
