/*
* @Author: SirMrE
* @http: http://www.sirmre.com/bdo-calculator
* @Copyright: (c) 2016 Mark Eliasen
* @license: May be freely distributed under the CC BY-NC 3.0 License 
*           (https://creativecommons.org/licenses/by-nc/3.0/)
* @Date:   2016-04-08 23:52:45
* @Last Modified by:   SirMrE
* @Last Modified time: 2016-04-15 02:01:42
*/


/* jslint unused: false, shadow: true */
/* global BDOdatabase */

var BDOcalculator = {
    "gear": {}, // holds the selected gear
    "sets": {}, // used for calculating the set effects and number of set items.
    "stats": null, // a copy of the stats from the BDOdatabase file

    init: function() {
        // Reset the gear
        this.gear = {
            "main-weapon": {
                "enhancement": 0,
                "item_name": "",
                "item": {},
                "gems": {
                    "1": {
                        "gem_name": "",
                        "gem": {}
                    },
                    "2": {
                        "gem_name": "",
                        "gem": {}
                    }
                }
            },
            "secondary-weapon": {
                "enhancement": 0,
                "item_name": "",
                "item": {},
                "gems": {
                    "1": {
                        "gem_name": "",
                        "gem": {}
                    },
                    "2": {
                        "gem_name": "",
                        "gem": {}
                    }
                }
            },
            "helmet": {
                "enhancement": 0,
                "item_name": "",
                "item": {},
                "gems": {
                    "1": {
                        "gem_name": "",
                        "gem": {}
                    },
                    "2": {
                        "gem_name": "",
                        "gem": {}
                    }
                }
            },
            "armor": {
                "enhancement": 0,
                "item_name": "",
                "item": {},
                "gems": {
                    "1": {
                        "gem_name": "",
                        "gem": {}
                    },
                    "2": {
                        "gem_name": "",
                        "gem": {}
                    }
                }
            },
            "gloves": {
                "enhancement": 0,
                "item_name": "",
                "item": {},
                "gems": {
                    "1": {
                        "gem_name": "",
                        "gem": {}
                    },
                    "2": {
                        "gem_name": "",
                        "gem": {}
                    }
                }
            },
            "shoes": {
                "enhancement": 0,
                "item_name": "",
                "item": {},
                "gems": {
                    "1": {
                        "gem_name": "",
                        "gem": {}
                    },
                    "2": {
                        "gem_name": "",
                        "gem": {}
                    }
                }
            },
            "rings": {
                "1": {
                    "enhancement": 0,
                    "item_name": "",
                    "item": {}
                },
                "2": {
                    "enhancement": 0,
                    "item_name": "",
                    "item": {}
                }
            },
            "earrings": {
                "1": {
                    "enhancement": 0,
                    "item_name": "",
                    "item": {}
                },
                "2": {
                    "enhancement": 0,
                    "item_name": "",
                    "item": {}
                }
            },
            "necklace": {
                "enhancement": 0,
                "item_name": "",
                "item": {}
            },
            "belt": {
                "enhancement": 0,
                "item_name": "",
                "item": {}
            }
        };

        this.reset(); 
    },

    setGear: function (itemObj, type, item_no, item_name, item_itemset, callback) {
        callback = (typeof callback === "function" ? callback : function() {});

        if (typeof itemObj === "undefined") {
            itemObj = {};
        }

        if ($.inArray(type, ["ring", "earring"]) !== -1) {
            this.gear[type + "s"][item_no].item = itemObj;
            this.gear[type + "s"][item_no].item_name = item_name;
        } else if (item_itemset === "gems") {
            this.gear[type].gems[item_no].gem = itemObj;
            this.gear[type].gems[item_no].gem_name = item_name;
        } else {
            if (typeof this.gear[type].item !== "undefined") {
                this.gear[type].item = itemObj;
                this.gear[type].item_name = item_name;
                this.gear[type].gems = {
                    "1": {
                        "gem_name": "",
                        "gem": {}
                    },
                    "2": {
                        "gem_name": "",
                        "gem": {}
                    }
                };
            }
        }

        callback();
    },

    setEnchantmentLevel: function(type, item_no, level, callback) {
        callback = (typeof callback === "function" ? callback : function() {});

        if ($.inArray(type, ["ring", "earring"]) !== -1) {
            this.gear[type + "s"][item_no].enhancement = String(level);
        } else {
            this.gear[type].enhancement = String(level);
        }

        callback();
    },

    reset: function() {
        // Reset the stats
        this.stats = $.extend(true,{},BDOdatabase.stats);

        // Reset the set counter
        this.sets = {};
    },

    addStat: function(stat_key, value) {
        if (stat_key in this.stats) {
            if (stat_key === "special") {
                this.stats.special.specials.push(value);
                return;
            }

            if (typeof this.stats[stat_key].total === 'undefined' && typeof this.stats[stat_key].min === 'undefined') {
                this.stats[stat_key].active = true;
                return;
            }

            if (stat_key === "ap") {
                if (parseInt(value) === value) {
                    value = [
                        value,
                        value
                    ];
                } else {
                    value = value.split('-');
                }

                this.stats[stat_key].min += parseInt(value[0]);
                this.stats[stat_key].max += parseInt(value[1]);

            } else {
                this.stats[stat_key].total += value;
            }
        }
    },

    calculateSetEffects: function() {
        if (Object.keys(this.sets).length === 0) {
            return;
        }

        for (var set_name in this.sets) {
            if (!this.sets.hasOwnProperty(set_name)) {
                continue;
            }

            if (typeof BDOdatabase.set_effects[set_name] === 'undefined') {
                continue;
            }

            var set_effects = BDOdatabase.set_effects[set_name],
                set_pieces_count = this.sets[set_name].length;

            // check for set pieces bonus
            for (var item_count in set_effects.pieces) {
                if (!set_effects.pieces.hasOwnProperty(item_count)) {
                    continue;
                }

                var effects = set_effects.pieces[item_count];
                    item_count = parseInt(item_count);

                if (item_count <= set_pieces_count) {
                    for (var effect_key in effects) {
                        if (!effects.hasOwnProperty(effect_key)) {
                            continue;
                        }

                        this.addStat(effect_key, effects[effect_key]);
                    }
                }
            }

            // check for set item combo bonus
            for (var combo_key in set_effects.combos) {
                if (!set_effects.combos.hasOwnProperty(combo_key)) {
                    continue;
                }

                var effects = set_effects.combos[combo_key].effects,
                    combo_complete = true,
                    combo_items = set_effects.combos[combo_key].pieces;

                for (var i = combo_items.length - 1; i >= 0; i--) {
                    if ($.inArray(combo_items[i], this.sets[set_name]) === -1) {
                        combo_complete = false;
                        break;
                    }
                }

                if (combo_complete) {
                    for (var effect_key in effects) {
                        if (!effects.hasOwnProperty(effect_key)) {
                            continue;
                        }

                        this.addStat(effect_key, effects[effect_key]);
                    }
                }
            }
        }
    },

    addToSets: function(setName, itemType) {
        if (typeof this.sets[setName] === 'undefined') {
            this.sets[setName] = [];
        }

        this.sets[setName].push(itemType);
    },

    getItemStat: function(itemObj, stat_key, getEffect, enhancement_level) {
        var getEffect = (typeof getEffect === "undefined" ? false : getEffect),
            stat = (getEffect ? itemObj.item_effects[stat_key] : itemObj[stat_key]);

        if (String(itemObj.enhancement) !== "undefined" && String(enhancement_level) !== "0") {
            if (typeof itemObj.enhancement[String(enhancement_level)][stat_key] !== 'undefined') {
                stat = itemObj.enhancement[String(enhancement_level)][stat_key];
            }
        }

        return stat;
    },

    getGearStat: function(itemObj, stat_key, getEffect) {
        var getEffect = (typeof getEffect === "undefined" ? false : true),
            stat = (getEffect ? itemObj.item.item_effects[stat_key] : itemObj.item[stat_key]);

        if (String(itemObj.enhancement) !== "undefined" && itemObj.enhancement !== "0") {
            if (typeof itemObj.item.enhancement[String(itemObj.enhancement)][stat_key] !== 'undefined') {
                stat = itemObj.item.enhancement[String(itemObj.enhancement)][stat_key];
            }
        }

        return stat;
    },

    calculate: function () {
        $('.stats').html('');
        this.reset();

        for (var gear_key in this.gear) {
            if (!this.gear.hasOwnProperty(gear_key)) {
                continue;
            }

            // Loop "static" stats like AP and DP
            // since you can have 2 rings and earrings, we will have to run a loop on each of the
            if ($.inArray(gear_key, ["rings", "earrings"]) !== -1) {
                for (var acc_key in this.gear[gear_key]) {
                    if (!this.gear[gear_key].hasOwnProperty(acc_key)) {
                        continue;
                    }

                    var accessory = this.gear[gear_key][acc_key];

                    if (Object.keys(accessory.item).length === 0) {
                        continue;
                    }

                    // loop the static stats of each accessory.
                    for (var assec_stat in accessory.item) {
                        if (!accessory.item.hasOwnProperty(assec_stat)) {
                            continue;
                        }

                        this.addStat(assec_stat, this.getGearStat(accessory, assec_stat));
                    }

                    // Loop item effects
                    for (var effect_key in accessory.item.item_effects) {
                        if (!accessory.item.item_effects.hasOwnProperty(effect_key)) {
                            continue;
                        }

                        this.addStat(effect_key, this.getGearStat(accessory, effect_key, true));
                    }
                }
            } else {
                if (Object.keys(this.gear[gear_key].item).length > 0) {
                    for (var stat_key in this.gear[gear_key].item) {
                        if (!this.gear[gear_key].item.hasOwnProperty(stat_key)) {
                            continue;
                        }

                        var gear_obj = this.gear[gear_key].item;
                        this.addStat(stat_key, this.getGearStat(this.gear[gear_key], stat_key));
                    }

                    for (var effect_key in this.gear[gear_key].item.item_effects) {
                        if (!this.gear[gear_key].item.item_effects.hasOwnProperty(effect_key)) {
                            continue;
                        }

                        this.addStat(effect_key, this.getGearStat(this.gear[gear_key], effect_key, true));
                    }

                    for (var gem_key in this.gear[gear_key].gems) {
                        if (!this.gear[gear_key].gems.hasOwnProperty(gem_key)) {
                            continue;
                        }

                        var gem = this.gear[gear_key].gems[gem_key].gem;

                        for (var eff_key in gem.item_effects) {
                            if (!gem.item_effects.hasOwnProperty(eff_key)) {
                                continue;
                            }

                            if (gem.incompatible.length) {
                                if ($.inArray(this.gear[gear_key].gems[(gem_key === "1" ? "2" : "1")].gem_name, gem.incompatible) !== -1) {
                                    continue;
                                }
                            }

                            this.addStat(eff_key, gem.item_effects[eff_key]);
                        }
                    }

                    this.addToSets(this.gear[gear_key].item.set, gear_key);

                    // Item-slot specific calculations
                    switch (gear_key) {
                        case "main-weapon":
                        case "secondary-weapon":
                            this.addStat("ap", this.getGearStat(this.gear[gear_key], "ap_min") + '-' + this.getGearStat(this.gear[gear_key], "ap_max"));
                            break;
                    }
                }
            }
        }

        this.calculateSetEffects();

        for (var key in this.stats) {
            if (!this.stats.hasOwnProperty(key)) {
                continue;
            }

            var obj = this.stats[key];

            switch (key) {
                case "special":
                    for (var i = obj.specials.length - 1; i >= 0; i--) {
                        $(obj.target).append('<li>' + obj.specials[i] + '</li>');
                    }
                    break;

                case "ap":
                    $('.stat-ap span').text(obj.min + ' ~ ' + obj.max);
                    break;

                case "dp":
                    $('.stat-dp span').text(obj.total);
                    break;

                default:
                    if (typeof obj.total === 'undefined') {
                        if (obj.active) {
                            this.stats.special.specials.push(obj.title);
                        }

                        continue;
                    }

                    if (obj.total === 0) {
                        continue;
                    }

                    $(obj.target).append('<li><strong>' + obj.title + ':</strong> ' + obj.total + obj.symbol + '</li>');
                    break;
            }
        }
    }
};