/**
 * DualMark Studio — Self-Hosted Dynamic Link Resolver (Zero-SaaS Engine)
 * Compiles routing tables, geo-targeted content switches, and instant recall kill-switches.
 * Generates standalone SQLite databases, JSON rules, Cloudflare Workers, and Nginx edge maps.
 */
(function(globalScope) {
  'use strict';

  var DEFAULT_RULES = [
    {
      id: 'rule_1',
      gtin: '00812345678901',
      itemTitle: 'Organic Cold-Pressed Almond Milk 32oz',
      lot: 'BATCH-2026-A',
      serial: '*',
      isRecalled: false,
      recallNoticeUrl: 'https://safety.brand.com/recall-alert/fda-2026-almond',
      defaultUrl: 'https://brand.com/products/almond-milk',
      geoRules: [
        { country: 'US', targetUrl: 'https://brand.com/us/nutrition/almond-milk' },
        { country: 'FR', targetUrl: 'https://brand.com/fr/tri-recyclage-almond' },
        { country: 'DE', targetUrl: 'https://brand.com/de/pfand-ruecknahme-almond' },
        { country: 'JP', targetUrl: 'https://brand.com/jp/allergen-spec-almond' }
      ]
    },
    {
      id: 'rule_2',
      gtin: '00854921004128',
      itemTitle: 'Infant Formula Powder 400g (Stage 1)',
      lot: 'LOT-9924-REV',
      serial: 'SN-00100..SN-00500',
      isRecalled: true,
      recallNoticeUrl: 'https://recalls.fda.gov/cfsan/2026/safety-alert-formula',
      defaultUrl: 'https://brand.com/baby/stage-1',
      geoRules: [
        { country: 'US', targetUrl: 'https://brand.com/us/baby/stage-1-safety' },
        { country: 'CA', targetUrl: 'https://brand.com/ca/recall-warning-formula' }
      ]
    }
  ];

  function DynamicResolver() {
    var saved = null;
    try {
      if (typeof localStorage !== 'undefined') {
        saved = localStorage.getItem('dualmark_resolver_rules');
      } else if (typeof window !== 'undefined' && window.localStorage) {
        saved = window.localStorage.getItem('dualmark_resolver_rules');
      }
    } catch (e) {}
    this.rules = JSON.parse(saved || 'null') || DEFAULT_RULES;
    this.initDb();
  }

  DynamicResolver.prototype = {
    initDb: function() {
      var self = this;
      if (typeof window !== 'undefined' && window.DualMarkDB) {
        window.DualMarkDB.getAll('resolver_rules').then(function(rules) {
          if (rules && rules.length > 0) {
            self.rules = rules;
          } else if (self.rules.length > 0) {
            self.rules.forEach(function(r) {
              window.DualMarkDB.put('resolver_rules', r);
            });
          }
        }).catch(function(e) {
          console.warn('[DynamicResolver] DualMarkDB load error', e);
        });
      }
    },

    save: function() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('dualmark_resolver_rules', JSON.stringify(this.rules));
        } else if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('dualmark_resolver_rules', JSON.stringify(this.rules));
        }
      } catch (e) {
        console.warn('[DynamicResolver] LocalStorage quota exceeded, relying on IndexedDB', e);
      }
      if (typeof window !== 'undefined' && window.DualMarkDB) {
        this.rules.forEach(function(r) {
          window.DualMarkDB.put('resolver_rules', r);
        });
      }
    },

    getRules: function() {
      return this.rules;
    },

    addRule: function(rule) {
      if (!rule.id) rule.id = 'rule_' + Date.now();
      this.rules.unshift(rule);
      this.save();
      return rule;
    },

    updateRule: function(id, updatedFields) {
      for (var i = 0; i < this.rules.length; i++) {
        if (this.rules[i].id === id) {
          Object.assign(this.rules[i], updatedFields);
          this.save();
          return this.rules[i];
        }
      }
      return null;
    },

    deleteRule: function(id) {
      this.rules = this.rules.filter(function(r) { return r.id !== id; });
      this.save();
    },

    toggleRecall: function(id) {
      for (var i = 0; i < this.rules.length; i++) {
        if (this.rules[i].id === id) {
          this.rules[i].isRecalled = !this.rules[i].isRecalled;
          this.save();
          return this.rules[i];
        }
      }
      return null;
    },

    matchesSerial: function(ruleSerial, inputSerial) {
      if (!ruleSerial || ruleSerial === '*') return true;
      if (!inputSerial) return true;
      ruleSerial = ruleSerial.trim();
      inputSerial = inputSerial.trim();
      if (ruleSerial === inputSerial) return true;

      // Range matching: "SN-00100..SN-00500" or "100..500"
      if (ruleSerial.indexOf('..') !== -1) {
        var parts = ruleSerial.split('..');
        var start = parts[0].trim();
        var end = parts[1].trim();
        var matchStart = start.match(/^(.*?)(\d+)$/);
        var matchEnd = end.match(/^(.*?)(\d+)$/);
        var matchInput = inputSerial.match(/^(.*?)(\d+)$/);
        if (matchStart && matchEnd && matchInput) {
          if (matchStart[1] === matchInput[1] && matchEnd[1] === matchInput[1]) {
            var numStart = parseInt(matchStart[2], 10);
            var numEnd = parseInt(matchEnd[2], 10);
            var numInput = parseInt(matchInput[2], 10);
            return numInput >= numStart && numInput <= numEnd;
          }
        }
        return inputSerial >= start && inputSerial <= end;
      }

      // Comma-separated list
      if (ruleSerial.indexOf(',') !== -1) {
        var list = ruleSerial.split(',').map(function(s) { return s.trim(); });
        return list.indexOf(inputSerial) !== -1;
      }

      // Wildcard
      if (ruleSerial.indexOf('*') !== -1) {
        var regex = new RegExp('^' + ruleSerial.replace(/\*/g, '.*') + '$');
        return regex.test(inputSerial);
      }

      return false;
    },

    // Resolve URL for incoming request
    resolve: function(gtin, lot, serial, countryCode) {
      countryCode = (countryCode || 'US').toUpperCase();
      for (var i = 0; i < this.rules.length; i++) {
        var r = this.rules[i];
        if (r.gtin === gtin) {
          // Check lot match if specified
          if (r.lot && r.lot !== '*' && lot && r.lot !== lot) continue;

          // Check serial match if specified
          if (r.serial && r.serial !== '*' && serial && !this.matchesSerial(r.serial, serial)) continue;

          // 1. Instant Recall Kill-Switch overrides everything
          if (r.isRecalled) {
            return {
              targetUrl: r.recallNoticeUrl,
              ruleMatched: r.id,
              status: 'RECALLED_SAFETY_OVERRIDE',
              message: 'EMERGENCY RECALL KILL-SWITCH ACTIVE'
            };
          }

          // 2. Geo-targeted rules
          if (r.geoRules && r.geoRules.length > 0) {
            for (var g = 0; g < r.geoRules.length; g++) {
              if (r.geoRules[g].country === countryCode) {
                return {
                  targetUrl: r.geoRules[g].targetUrl,
                  ruleMatched: r.id,
                  status: 'GEO_MATCH',
                  country: countryCode
                };
              }
            }
          }

          // 3. Default fallback
          return {
            targetUrl: r.defaultUrl,
            ruleMatched: r.id,
            status: 'DEFAULT_FALLBACK'
          };
        }
      }

      return {
        targetUrl: 'https://id.dualmark.studio/01/' + gtin + '?status=unregistered',
        ruleMatched: null,
        status: 'UNREGISTERED_GTIN'
      };
    },

    // RFC 9264 & GS1 Digital Link Content Negotiation
    resolveWithContentNegotiation: function(gtin, options) {
      options = options || {};
      var lot = options.lot || '';
      var serial = options.serial || '';
      var countryCode = (options.countryCode || 'US').toUpperCase();
      var linkType = (options.linkType || '').toLowerCase().trim();
      if (linkType.indexOf('gs1:') === 0) linkType = linkType.substring(4);
      var accept = (options.acceptHeader || options.accept || '').toLowerCase();

      var r = null;
      for (var i = 0; i < this.rules.length; i++) {
        if (this.rules[i].gtin === gtin) {
          if (this.rules[i].lot && this.rules[i].lot !== '*' && lot && this.rules[i].lot !== lot) continue;
          if (this.rules[i].serial && this.rules[i].serial !== '*' && serial && !this.matchesSerial(this.rules[i].serial, serial)) continue;
          r = this.rules[i];
          break;
        }
      }

      if (!r) {
        return {
          status: 'UNREGISTERED_GTIN',
          httpStatus: 404,
          targetUrl: 'https://id.dualmark.studio/01/' + gtin + '?status=unregistered',
          message: 'GTIN not found in local routing table'
        };
      }

      var baseUrl = 'https://id.dualmark.studio/01/' + r.gtin;

      // 1. Linkset requested via Accept header or ?linkType=all / ?linkType=linkset
      if (accept.indexOf('application/linkset+json') !== -1 || linkType === 'all' || linkType === 'linkset') {
        return {
          status: 'LINKSET_RESOLVED',
          httpStatus: 200,
          contentType: 'application/linkset+json',
          body: this.exportLinksetJson(gtin),
          headers: {
            'Content-Type': 'application/linkset+json',
            'Link': this.exportLinksetHeaders(gtin)
          }
        };
      }

      // 2. Immediate safety recall kill-switch overrides
      if (r.isRecalled) {
        return {
          status: 'RECALLED_SAFETY_OVERRIDE',
          httpStatus: 307,
          targetUrl: r.recallNoticeUrl || (baseUrl + '/recall'),
          linkType: 'gs1:hasRecallNotice',
          headers: {
            'Location': r.recallNoticeUrl || (baseUrl + '/recall'),
            'Link': this.exportLinksetHeaders(gtin)
          },
          message: 'EMERGENCY RECALL KILL-SWITCH ACTIVE'
        };
      }

      // 3. Specific linkType resolution
      if (linkType) {
        if (linkType === 'pip' || linkType === 'productinfo') {
          var targetUrl = r.defaultUrl;
          if (r.geoRules && r.geoRules.length > 0) {
            for (var g = 0; g < r.geoRules.length; g++) {
              if (r.geoRules[g].country === countryCode) {
                targetUrl = r.geoRules[g].targetUrl;
                break;
              }
            }
          }
          return {
            status: 'LINKTYPE_MATCH',
            httpStatus: 307,
            linkType: 'gs1:pip',
            targetUrl: targetUrl,
            headers: {
              'Location': targetUrl,
              'Link': this.exportLinksetHeaders(gtin)
            }
          };
        } else if (linkType === 'epcis' || linkType === 'traceability' || linkType === 'events') {
          var epcisUrl = r.traceabilityUrl || (baseUrl + '/traceability');
          return {
            status: 'LINKTYPE_MATCH',
            httpStatus: 307,
            linkType: 'gs1:traceability',
            targetUrl: epcisUrl,
            headers: {
              'Location': epcisUrl,
              'Link': this.exportLinksetHeaders(gtin)
            }
          };
        } else if (linkType === 'sds' || linkType === 'safety' || linkType === 'certification' || linkType === 'certificationinfo') {
          var sdsUrl = r.safetyUrl || (baseUrl + '/safety');
          return {
            status: 'LINKTYPE_MATCH',
            httpStatus: 307,
            linkType: 'gs1:certificationInfo',
            targetUrl: sdsUrl,
            headers: {
              'Location': sdsUrl,
              'Link': this.exportLinksetHeaders(gtin)
            }
          };
        } else if (linkType === 'hasrecallnotice' || linkType === 'recall') {
          var recUrl = r.recallNoticeUrl || (baseUrl + '/recall');
          return {
            status: 'LINKTYPE_MATCH',
            httpStatus: 307,
            linkType: 'gs1:hasRecallNotice',
            targetUrl: recUrl,
            headers: {
              'Location': recUrl,
              'Link': this.exportLinksetHeaders(gtin)
            }
          };
        }
      }

      // 4. Fallback to standard geo / default URL resolution
      var standard = this.resolve(gtin, lot, serial, countryCode);
      return {
        status: standard.status,
        httpStatus: 307,
        targetUrl: standard.targetUrl,
        headers: {
          'Location': standard.targetUrl,
          'Link': this.exportLinksetHeaders(gtin)
        }
      };
    },

    // Export 1: SQLite Database DDL & Data Dump (.sql / .sqlite)
    exportSqlScript: function() {
      var lines = [
        '-- DualMark Studio Self-Hosted Dynamic Link Resolver',
        '-- Zero-SaaS SQLite Routing Database Schema & Seed Data',
        '-- Compliant with GS1 Digital Link Standard v1.2',
        '',
        'PRAGMA foreign_keys = ON;',
        'BEGIN TRANSACTION;',
        '',
        'CREATE TABLE IF NOT EXISTS gs1_routes (',
        '    id TEXT PRIMARY KEY,',
        '    gtin TEXT NOT NULL,',
        '    item_title TEXT,',
        '    lot_pattern TEXT DEFAULT "*",',
        '    serial_pattern TEXT DEFAULT "*",',
        '    is_recalled INTEGER NOT NULL DEFAULT 0,',
        '    recall_url TEXT,',
        '    default_url TEXT NOT NULL,',
        '    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        ');',
        '',
        'CREATE TABLE IF NOT EXISTS gs1_geo_redirects (',
        '    id INTEGER PRIMARY KEY AUTOINCREMENT,',
        '    route_id TEXT NOT NULL,',
        '    country_code TEXT NOT NULL,',
        '    target_url TEXT NOT NULL,',
        '    FOREIGN KEY (route_id) REFERENCES gs1_routes(id) ON DELETE CASCADE',
        ');',
        '',
        'CREATE INDEX IF NOT EXISTS idx_gs1_routes_gtin ON gs1_routes(gtin);',
        'CREATE INDEX IF NOT EXISTS idx_gs1_geo ON gs1_geo_redirects(route_id, country_code);',
        ''
      ];

      for (var i = 0; i < this.rules.length; i++) {
        var r = this.rules[i];
        lines.push("INSERT INTO gs1_routes (id, gtin, item_title, lot_pattern, serial_pattern, is_recalled, recall_url, default_url) VALUES (" +
          "'" + r.id + "', " +
          "'" + r.gtin + "', " +
          "'" + (r.itemTitle || '').replace(/'/g, "''") + "', " +
          "'" + (r.lot || '*').replace(/'/g, "''") + "', " +
          "'" + (r.serial || '*').replace(/'/g, "''") + "', " +
          (r.isRecalled ? 1 : 0) + ", " +
          "'" + (r.recallNoticeUrl || '').replace(/'/g, "''") + "', " +
          "'" + (r.defaultUrl || '').replace(/'/g, "''") + "'" +
          ");"
        );

        if (r.geoRules && r.geoRules.length > 0) {
          for (var g = 0; g < r.geoRules.length; g++) {
            var geo = r.geoRules[g];
            lines.push("INSERT INTO gs1_geo_redirects (route_id, country_code, target_url) VALUES (" +
              "'" + r.id + "', " +
              "'" + geo.country + "', " +
              "'" + geo.targetUrl.replace(/'/g, "''") + "'" +
              ");"
            );
          }
        }
      }

      lines.push('');
      lines.push('COMMIT;');
      return lines.join('\n');
    },

    // Export 2: Static JSON Rules Manifest
    exportJsonRules: function() {
      return JSON.stringify({
        schemaVersion: '1.2.0',
        generatedAt: new Date().toISOString(),
        engine: 'DualMark Studio Zero-SaaS Edge Resolver',
        ruleCount: this.rules.length,
        routes: this.rules
      }, null, 2);
    },

    // Export 3: Cloudflare Workers Script (Zero-SaaS edge server)
    exportCloudflareWorker: function() {
      return [
        '/**',
        ' * DualMark Studio — Cloudflare Worker Edge Resolver',
        ' * Zero-SaaS Dynamic Link Resolver for GS1 Digital Link Sunrise 2027',
        ' */',
        'const ROUTES = ' + JSON.stringify(this.rules, null, 2) + ';',
        '',
        'addEventListener("fetch", event => {',
        '  event.respondWith(handleRequest(event.request));',
        '});',
        '',
        'async function handleRequest(request) {',
        '  const url = new URL(request.url);',
        '  const country = request.headers.get("cf-ipcountry") || "US";',
        '  const match = url.pathname.match(/^\\/01\\/(\\d{14})(?:\\/10\\/([^/]+))?(?:\\/21\\/([^/]+))?/);',
        '',
        '  if (!match) {',
        '    return new Response("DualMark Edge Resolver: Scan a valid GS1 Digital Link", { status: 404 });',
        '  }',
        '',
        '  const gtin = match[1];',
        '  const lot = match[2] || "";',
        '  const serial = match[3] || "";',
        '',
        '  for (const rule of ROUTES) {',
        '    if (rule.gtin === gtin) {',
        '      // Recall kill-switch takes immediate precedence',
        '      if (rule.isRecalled) {',
        '        return Response.redirect(rule.recallNoticeUrl, 302);',
        '      }',
        '      // Geo-target rules',
        '      if (rule.geoRules) {',
        '        const geo = rule.geoRules.find(g => g.country === country);',
        '        if (geo) return Response.redirect(geo.targetUrl, 302);',
        '      }',
        '      return Response.redirect(rule.defaultUrl, 302);',
        '    }',
        '  }',
        '',
        '  return new Response("GTIN not found in local routing table: " + gtin, { status: 404 });',
        '}'
      ].join('\n');
    },

    // Export 4: Nginx Map Configuration
    exportNginxConfig: function() {
      var lines = [
        '# DualMark Studio — Nginx GS1 Digital Link Map Configuration',
        '# Include in /etc/nginx/conf.d/gs1_routes.conf',
        '',
        'map $uri $gs1_redirect_target {'
      ];

      for (var i = 0; i < this.rules.length; i++) {
        var r = this.rules[i];
        var target = r.isRecalled ? r.recallNoticeUrl : r.defaultUrl;
        var pattern = '~^/01/' + r.gtin;
        if (r.lot && r.lot !== '*') {
          pattern += '/10/' + r.lot;
        }
        lines.push('    "' + pattern + '"    ' + target + ';');
      }

      lines.push('    default    https://id.dualmark.studio/not-found;');
      lines.push('}');
      lines.push('');
      lines.push('map $geoip_country_code $gs1_geo_redirect {');
      for (var j = 0; j < this.rules.length; j++) {
        var r2 = this.rules[j];
        if (r2.geoRules && r2.geoRules.length > 0) {
          for (var g = 0; g < r2.geoRules.length; g++) {
            lines.push('    "' + r2.geoRules[g].country + '"    ' + r2.geoRules[g].targetUrl + ';');
          }
        }
      }
      lines.push('    default    "";');
      lines.push('}');
      lines.push('');
      lines.push('server {');
      lines.push('    listen 80;');
      lines.push('    server_name id.brand.com;');
      lines.push('    location /01/ {');
      lines.push('        if ($gs1_geo_redirect != "") {');
      lines.push('            return 302 $gs1_geo_redirect;');
      lines.push('        }');
      lines.push('        return 302 $gs1_redirect_target;');
      lines.push('    }');
      lines.push('}');
      return lines.join('\n');
    },

    // Export 5: GS1 Linkset (RFC 9264 / GS1 Digital Link application/linkset+json)
    exportLinksetJson: function(gtin) {
      var r = null;
      if (gtin) {
        for (var i = 0; i < this.rules.length; i++) {
          if (this.rules[i].gtin === gtin) {
            r = this.rules[i];
            break;
          }
        }
      }
      if (!r) r = this.rules[0] || {};
      var targetGtin = r.gtin || gtin || '00812345678901';
      var baseUrl = 'https://id.dualmark.studio/01/' + targetGtin;
      var linkset = {
        "anchor": baseUrl,
        "itemDescription": r.itemTitle || "DualMark Certified Packaging Item",
        "links": [
          {
            "href": r.defaultUrl || (baseUrl + '/info'),
            "rel": "gs1:pip",
            "type": "text/html",
            "title": "Product Information Page"
          },
          {
            "href": baseUrl + '/safety',
            "rel": "gs1:certificationInfo",
            "type": "application/json",
            "title": "Safety & Compliance Certifications"
          },
          {
            "href": baseUrl + '/traceability',
            "rel": "gs1:traceability",
            "type": "application/ld+json",
            "title": "FSMA 204 Traceability EPCIS"
          }
        ]
      };
      if (r.isRecalled) {
        linkset.links.unshift({
          "href": r.recallNoticeUrl || (baseUrl + '/recall'),
          "rel": "gs1:hasRecallNotice",
          "type": "text/html",
          "title": "URGENT: Product Safety Recall Notice"
        });
      }
      return JSON.stringify([linkset], null, 2);
    },

    exportLinksetHeaders: function(gtin) {
      var r = null;
      if (gtin) {
        for (var i = 0; i < this.rules.length; i++) {
          if (this.rules[i].gtin === gtin) {
            r = this.rules[i];
            break;
          }
        }
      }
      if (!r) r = this.rules[0] || {};
      var targetGtin = r.gtin || gtin || '00812345678901';
      var baseUrl = 'https://id.dualmark.studio/01/' + targetGtin;
      var headers = [
        '<' + (r.defaultUrl || (baseUrl + '/info')) + '>; rel="gs1:pip"; type="text/html"; title="Product Information Page"',
        '<' + baseUrl + '/traceability>; rel="gs1:traceability"; type="application/ld+json"; title="FSMA 204 EPCIS"'
      ];
      if (r.isRecalled) {
        headers.unshift('<' + (r.recallNoticeUrl || (baseUrl + '/recall')) + '>; rel="gs1:hasRecallNotice"; type="text/html"');
      }
      return 'Link: ' + headers.join(', ');
    }
  };

  var resolver = new DynamicResolver();

  if (typeof window !== 'undefined') {
    window.DualMarkResolver = resolver;
    window.DynamicResolver = DynamicResolver;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.DualMarkResolver = resolver;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = resolver;
    module.exports.DynamicResolver = DynamicResolver;
  }

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));

