/*
* @Author: SirMrE
* @http: http://www.sirmre.com/bdo-calculator
* @Copyright: (c) 2016 Mark Eliasen
* @license: May be freely distributed under the CC BY-NC 3.0 License 
*           (https://creativecommons.org/licenses/by-nc/3.0/)
* @Date:   2016-04-07 20:53:22
* @Last Modified by:   SirMrE
* @Last Modified time: 2016-11-17 12:50:29
*/

/* global BDOdatabase, BDOcalculator */
/* jshint -W038, unused: false, shadow: true */

(function ($) {
    "use strict";

    var player_class = "";

    // Original from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    function getParameterByName(name) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
            results = regex.exec(window.location.href);

        if (!results) {
            return null;
        }

        if (!results[2]) {
            return '';
        }

        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    // little hacky, I know.
    function getGemType (item, slot) {
        var gemName = BDOcalculator.gear[item].gems[slot].gem_name,
            itemGems = Object.keys(BDOdatabase.gems[item]),
            allGems  = Object.keys(BDOdatabase.gems.all);

        if (gemName && allGems.indexOf(gemName) !== -1) {
            return "a" + allGems.indexOf(gemName);
        }

        return itemGems.indexOf(gemName);
    }

    // Object.keys(BDOdatabase.items.helmets).indexOf(5) == "Grunil Helmet"
    function saveConfig () {
        var save = [
            BDOdatabase.classes.indexOf(ucWords(player_class)),
            [
                Object.keys(BDOdatabase.items.helmets).indexOf(BDOcalculator.gear.helmet.item_name),
                parseInt(BDOcalculator.gear.helmet.enhancement),
                [
                    getGemType("helmet","1"),
                    getGemType("helmet","2")
                ]
            ],
            [
                Object.keys(BDOdatabase.items.armor).indexOf(BDOcalculator.gear.armor.item_name),
                parseInt(BDOcalculator.gear.armor.enhancement),
                [
                    getGemType("armor","1"),
                    getGemType("armor","2")
                ]
            ],
            [
                Object.keys(BDOdatabase.items.shoes).indexOf(BDOcalculator.gear.shoes.item_name),
                parseInt(BDOcalculator.gear.shoes.enhancement),
                [
                    getGemType("shoes","1"),
                    getGemType("shoes","2")
                ]
            ],
            [
                Object.keys(BDOdatabase.items.gloves).indexOf(BDOcalculator.gear.gloves.item_name),
                parseInt(BDOcalculator.gear.gloves.enhancement),
                [
                    getGemType("gloves","1"),
                    getGemType("gloves","2")
                ]
            ],
            [
                [
                    Object.keys(BDOdatabase.items.rings).indexOf(BDOcalculator.gear.rings["1"].item_name),
                    parseInt(BDOcalculator.gear.rings["1"].enhancement)
                ],
                [
                    Object.keys(BDOdatabase.items.rings).indexOf(BDOcalculator.gear.rings["2"].item_name),
                    parseInt(BDOcalculator.gear.rings["2"].enhancement)
                ]
            ],
            [
                [
                    Object.keys(BDOdatabase.items.earrings).indexOf(BDOcalculator.gear.earrings["1"].item_name),
                    parseInt(BDOcalculator.gear.earrings["1"].enhancement)
                ],
                [
                    Object.keys(BDOdatabase.items.earrings).indexOf(BDOcalculator.gear.earrings["2"].item_name),
                    parseInt(BDOcalculator.gear.earrings["2"].enhancement)
                ]
            ],
            [
                Object.keys(BDOdatabase.items.belts).indexOf(BDOcalculator.gear.belt.item_name),
                parseInt(BDOcalculator.gear.belt.enhancement)
            ],
            [
                Object.keys(BDOdatabase.items.necklaces).indexOf(BDOcalculator.gear.necklace.item_name),
                parseInt(BDOcalculator.gear.necklace.enhancement)
            ],
            [
                Object.keys(BDOdatabase.items["main-weapons"][player_class]).indexOf(BDOcalculator.gear["main-weapon"].item_name),
                parseInt(BDOcalculator.gear["main-weapon"].enhancement),
                [
                    getGemType("main-weapon","1"),
                    getGemType("main-weapon","2")
                ]
            ],
            [
                Object.keys(BDOdatabase.items["secondary-weapons"][player_class]).indexOf(BDOcalculator.gear["secondary-weapon"].item_name),
                parseInt(BDOcalculator.gear["secondary-weapon"].enhancement),
                [
                    getGemType("secondary-weapon","1"),
                    getGemType("secondary-weapon","2")
                ]
            ]
        ];

        var url = window.location.href.replace(window.location.search, "");

        $('#share-link').val(url + (url.indexOf('?') === -1 ? '?' : '&') + 'gear=' + JSON.stringify(save));
    }

    function loadConfig(callback) {
        var gear = getParameterByName('gear'),
            array_index = [
                "class",
                "helmet",
                "armor",
                "shoes",
                "gloves",
                "rings",
                "earrings",
                "belt",
                "necklace",
                "main-weapon",
                "secondary-weapon"
            ];

        callback = (typeof callback !== "undefined" ? callback : function(e) {});

        if (gear === null) {
            callback(false);
            return;
        }

        gear = JSON.parse(gear);

        if ($.inArray(ucWords(BDOdatabase.classes[gear[0]]), BDOdatabase.classes) === -1) {
            callback(false);
            return;
        }

        player_class = BDOdatabase.classes[gear[0]].toLowerCase();
        BDOcalculator.init();

        var c = gear.length - 1;
        for (var n = 1; n <= c; n++) {
            var item_key = array_index[n],
                item_type = item_key,
                item_itemset = item_key + (item_key === "armor" ? "" : (item_key.slice(-1) !== "s" ? "s" : "")),
                item = BDOdatabase.items[item_itemset],
                item_list = Object.keys(item),
                item_name = "",
                item_no;

            if (gear[n][0] === -1) {
                continue;
            }

            if (item_type === "rings" || item_type === "earrings") {
                for (var i = 1; i >= 0; i--) {
                    item_name = item_list[gear[n][i][0]];

                    if (item_name === "" || typeof item_name === "undefined") {
                        continue;
                    }

                    addItem(item_name, item_type.slice(0, -1), item_type, i + 1, gear[n][i][1], false);
                }
            } else {
                if (item_type === "main-weapon" || item_type === "secondary-weapon") {
                    item_name = Object.keys(item[player_class])[gear[n][0]];
                } else {
                    item_name = item_list[gear[n][0]];
                }

                if (item_name === "" || typeof item_name === "undefined") {
                    continue;
                }

                // set item
                addItem(item_name, item_type, item_itemset, item_no, gear[n][1], false);

                // set gems
                if ($.inArray(item_type, ["belt", "necklace"]) === -1) {
                    if (gear[n][2].length) {
                        var gem_list = Object.keys(BDOdatabase.gems[item_type]),
                            allgem_list = Object.keys(BDOdatabase.gems.all);

                        for (var i = 1; i >= 0; i--) {
                            if (gear[n][2][i] === -1) {
                                continue;
                            }

                            if (typeof gear[n][2][i] === "number") {
                                item_name = gem_list[gear[n][2][i]];
                            }

                            if (typeof gear[n][2][i] === "string") {
                                item_name = allgem_list[parseInt(gear[n][2][i].replace('a',""))];
                            }

                            if (item_name === "" || typeof item_name === "undefined") {
                                continue;
                            }

                            addItem(item_name, item_type, "gems", i + 1, null, false);
                        }
                    }
                }
            }
        }

        callback(true);
    }

    function getEnhancementMax (itemObj) {
        var enhancement_levels = Object.keys(itemObj.enhancement).length;

        if (enhancement_levels > 0) {
            if (enhancement_levels > BDOdatabase.max_gear_enhancement) {
                enhancement_levels = BDOdatabase.max_gear_enhancement;
            }
        }

        return enhancement_levels;
    }

    function ucWords(str) {
        return str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
            return letter.toUpperCase();
        });
    }

    function resetGearslotItem (item_type, item_no) {
        $("#equipment .gear-slot[data-type='" + item_type + "']" + (typeof item_no === 'undefined' ? '' : "[data-item='" + item_no + "']")).attr('style', '');
        $('#equipment .gem-slot.' + item_type + '1, .gem-slot.' + item_type + '2').attr('style', '').hide();
    }

    function setGearslotItem (item, item_type, item_no, item_itemset) {
        item_no = (typeof item_no === "undefined" ? "undefined" : item_no);

        if (item_itemset !== "gems") {
            $("#equipment .gear-slot[data-type='" + item_type + "']" + (item_no === 'undefined' ? '' : "[data-item='" + item_no + "']")).css({
                'border-color': BDOdatabase.rarities[item.rarity],
                'background': 'url(assets/images/48/' + ($.inArray(item_type, ["main-weapon", "secondary-weapon"]) === -1 ? item_type : BDOdatabase.class_weapons[player_class][item_type].replace(' ', '-').toLowerCase()) + '.png) no-repeat center center'
            });
        } else {
            $("#equipment .gem-slot[data-type='" + item_type + "']" + "[data-item='" + item_no + "']").css({
                'border-color': BDOdatabase.rarities[item.rarity]
            });
        }

        if ($.inArray(item_type, ["main-weapon", "secondary-weapon", "armor", "shoes", "gloves", "helmet"]) !== -1 && item_itemset !== "gems") {
            $('#equipment .gem-slot.' + item_type + '1, #equipment .gem-slot.' + item_type + '2').hide();

            if (item.gems > 0) {
                var gem;

                for (var i = item.gems; i > 0; i--) {
                    if (BDOcalculator.gear[item_type].gems[i].gem_name === "") {
                        $('#equipment .gem-slot.' + item_type + i).attr('style', '').show();
                        continue;
                    }

                    gem = BDOcalculator.gear[item_type].gems[i].gem;

                    $('#equipment .gem-slot.' + item_type + i).css({
                        'border-color': BDOdatabase.rarities[gem.rarity]
                    }).show();
                }
            }
        }
    }

    function addItem(item_name, item_type, item_itemset, item_no, level, calculate) {
        var item = (item_itemset === "gems" ? BDOdatabase.gems :  BDOdatabase.items[item_itemset]);
        calculate = (typeof calculate === "undefined" ? true : calculate);

        if (item_itemset !== "gems") {
            if ($.inArray(item_type, ["main-weapon", "secondary-weapon"]) !== -1) {
                item = item[player_class.toLowerCase()];
            }
        } else {
            if (typeof item[item_type][item_name] === 'undefined') {
                item = item.all;
            }
            else {
                item = item[item_type];
            }
        }

        item = item[item_name];

        BDOcalculator.setGear(item, item_type, item_no, item_name, item_itemset, function() {
            setGearslotItem(item, item_type, item_no, item_itemset);

            if (item_itemset !== "gems") {
                BDOcalculator.setEnchantmentLevel(item_type, item_no, level, function() {
                    if (calculate) {
                        BDOcalculator.calculate();
                    }
                });
            } else if (calculate) {
                BDOcalculator.calculate();
            }

            if (calculate) {
                saveConfig();
            }
        });
    }

    function generateGemItemPlate(item, item_type, item_no, key, c, selected) {
        c = (typeof c === 'undefined' ? 1 : c);

        var item_element = $('<div class="item-details ' + (selected ? ' selected ' : '') + 'col-md-10 col-md-offset-' + (c % 2 === 0 ? '2' : '1') + '"/>'),
            stat_element;

        // item name
        item_element.append('<div class="item-name">'+
                                '<strong style="color: ' + BDOdatabase.rarities[item.rarity] + '">' + key + '</strong>'+
                            '</div>');

        // item icon
        item_element.append('<div class="item-icon">'+
                                '<img src="assets/images/48/gem.png" alt="BDO Gear Calculator">'+
                            '</div>');

        // item choose button
        item_element.append('<button class="btn btn-sm btn-primary item-choose" data-item="' + key + '" data-itemset="gems" data-type="' + item_type + '" data-itemno="' + item_no + '">Choose</button>');

        // item effects
        stat_element = $('<div class="item-effects"/>');
        stat_element.append('<strong>Item Effects</strong>');

        if (Object.keys(item.item_effects).length > 0) {
            for (var stat_key in item.item_effects) {
                if (!item.item_effects.hasOwnProperty(stat_key)) {
                     continue;
                }

                if (stat_key === "special") {
                    stat_element.append('<strong>' + BDOdatabase.stats[stat_key].title + ':</strong><div>' + item.item_effects.special + '</div>');
                } else {
                    stat_element.append('<div>' + BDOdatabase.stats[stat_key].title + ' ' + item.item_effects[stat_key] + BDOdatabase.stats[stat_key].symbol + '</div>');
                }
            }
        } else {
            stat_element.append('<div>None.</div>');
        }

        stat_element.appendTo(item_element);

        // incompatible
        if (item.incompatible.length > 0) {
            stat_element = $('<div class="item-effects"/>');
            stat_element.append('<strong>It doesn\'t stack with:</strong>');

            for (var i = item.incompatible.length - 1; i >= 0; i--) {
                stat_element.append('<div>' + item.incompatible[i] + '</div>');
            }

            stat_element.appendTo(item_element);
        }

        return item_element;
    }

    function generateItemPlate(item, item_type, item_itemset, item_no, key, c, selected) {
        c = (typeof c === 'undefined' ? 1 : c);

        var item_element = $('<div class="item-details ' + (selected ? ' selected ' : '') + 'col-md-10 col-md-offset-' + (c % 2 === 0 ? '2' : '1') + '"/>'),
            stat_element,
            enhancement_level = 0;

        if ($.inArray(item_type, ["ring", "earring"]) !== -1) {
            if (BDOcalculator.gear[item_type + "s"][item_no].item_name === key) {
                enhancement_level = BDOcalculator.gear[item_type + "s"][item_no].enhancement;
            }
        } else {
            if (BDOcalculator.gear[item_type].item_name === key) {
                enhancement_level = BDOcalculator.gear[item_type].enhancement;
            }
        }

        // item name
        item_element.append('<div class="item-name">'+
                                '<strong style="color: ' + BDOdatabase.rarities[item.rarity] + '">' + key + '</strong>'+
                            '</div>');

        // item icon
        item_element.append('<div class="item-icon">'+
                                '<img src="assets/images/48/' + ($.inArray(item_type, ["main-weapon", "secondary-weapon"]) === -1 ? item_type : BDOdatabase.class_weapons[player_class][item_type].replace(' ', '-').toLowerCase()) + '.png" alt="BDO Gear Calculator">'+
                            '</div>');

        // item stats
        stat_element = $('<div class="item-stats"/>');

        if (typeof item.ap !== 'undefined') {
            stat_element.append('<div>AP: ' + BDOcalculator.getItemStat(item, "ap", false, enhancement_level) + '</div>');
        }
        if (typeof item.ap_min !== 'undefined') {
            stat_element.append('<div>AP: ' + BDOcalculator.getItemStat(item, "ap_min", false, enhancement_level) + '~' + BDOcalculator.getItemStat(item, "ap_max", false, enhancement_level) + '</div>');
        }
        if (typeof item.dp !== 'undefined') {
            stat_element.append('<div>DP: ' + BDOcalculator.getItemStat(item, "dp", false, enhancement_level) + '</div>');
        }
        stat_element.appendTo(item_element);

        // item choose button
        item_element.append('<button class="btn btn-sm btn-primary item-choose" data-enh="' + enhancement_level + '" data-item="' + key + '" data-itemset="' + item_itemset + '" data-type="' + item_type + '" data-itemno="' + item_no + '">Choose</button>');

        // item gems
        item_element.append('<div class="item-gems">'+
                                '<strong>Gem Slots:</strong>'+
                                '<div>' + item.gems + '</div>'+
                            '</div>');

        // item effects
        stat_element = $('<div class="item-effects"/>');
        stat_element.append('<strong>Item Effects</strong>');

        if (Object.keys(item.item_effects).length > 0) {
            for (var stat_key in item.item_effects) {
                if (!item.item_effects.hasOwnProperty(stat_key)) {
                     continue;
                }

                if (stat_key === "special") {
                    stat_element.append('<strong>' + BDOdatabase.stats[stat_key].title + ':</strong><div>' + item.item_effects.special + '</div>');
                } else {
                    stat_element.append('<div>' + BDOdatabase.stats[stat_key].title + ' ' + BDOcalculator.getItemStat(item, stat_key, true, enhancement_level) + BDOdatabase.stats[stat_key].symbol + '</div>');
                }
            }
        } else {
            stat_element.append('<div>None.</div>');
        }

        stat_element.appendTo(item_element);

        // item set effects
        stat_element = $('<div class="item-set-effects"/>');
        stat_element.append('<strong>Set Effects</strong>');

        if (typeof BDOdatabase.set_effects[item.set] !== 'undefined') {
            if (typeof BDOdatabase.set_effects[item.set].combos !== 'undefined') {

                for (var combos_key in BDOdatabase.set_effects[item.set].combos) {
                    if (!BDOdatabase.set_effects[item.set].combos.hasOwnProperty(combos_key)) {
                         continue;
                    }

                    var combos = BDOdatabase.set_effects[item.set].combos[combos_key],
                        effect_string = '';

                    for (var combo_eff_key in combos.effects) {
                        if (!combos.effects.hasOwnProperty(combo_eff_key)) {
                             continue;
                        }

                        effect_string += (effect_string === '' ? '<div><span>' + ucWords(combos.pieces.join(' + ')) + ':</span> ' : ' & ') + BDOdatabase.stats[combo_eff_key].title + ' +' + combos.effects[combo_eff_key] + BDOdatabase.stats[combo_eff_key].symbol;
                    }

                    stat_element.append(effect_string + '</div>');
                }
            }

            if (typeof BDOdatabase.set_effects[item.set].pieces !== 'undefined') {

                for (var pieces_key in BDOdatabase.set_effects[item.set].pieces) {
                    if (!BDOdatabase.set_effects[item.set].pieces.hasOwnProperty(pieces_key)) {
                         continue;
                    }

                    var pieces_effects = BDOdatabase.set_effects[item.set].pieces[pieces_key],
                        effect_string = '';

                    for (var set_eff_key in pieces_effects) {
                        if (!pieces_effects.hasOwnProperty(set_eff_key)) {
                             continue;
                        }

                        effect_string += (effect_string === '' ? '<div><span>' + pieces_key + '-Pieces:</span> ' : ' & ') + BDOdatabase.stats[set_eff_key].title + ' +' + pieces_effects[set_eff_key] + BDOdatabase.stats[set_eff_key].symbol;
                    }

                    stat_element.append(effect_string + '</div>');
                }
            }
        } else {
            stat_element.append('<div>None.</div>');
        }

        stat_element.appendTo(item_element);

        // item enhancement effects
        item_element.append('<div class="item-enhancement-effects">'+
                                '<strong>Enhancement Effects:</strong>'+
                                '<div>' + (typeof item.enhancement_text === 'undefined' || item.enhancement_text === "" ? 'Info Missing..' : item.enhancement_text) + '</div>'+
                            '</div>');

        // item icon
        item_element.append('<div class="item-enhancement-level">'+
                                '<strong>Enhancement Level:</strong>'+
                                '<input data-slider-min="" data-slider-max="' + getEnhancementMax(item) + '" data-slider-value="' + enhancement_level + '" class="item-enhancement-slider">'+
                            '</div>');

        return item_element;
    }

    $(document).ready(function() {
        $('#player-class').select2({
            width: '100%',
            data: (typeof $('#player-class').attr('placeholder') === 'undefined' ? BDOdatabase.classes : [$('#player-class').attr('placeholder')].concat(BDOdatabase.classes))
        });

        loadConfig(function(loaded) {
            if (loaded) {
                $('#player-class').val(ucWords(player_class)).trigger('change.select2');
                BDOcalculator.calculate();
                saveConfig();

                $("#calculator-section").slideDown("fast");
            }
        });

        // when a user selects a class, we initiate the equipment dropdowns based on class, hides the classes menu and shows the equipment selection menu.
        $("#player-class").on("change", function() {
            player_class = $(this).val().toLowerCase();

            BDOcalculator.init();
            BDOcalculator.calculate();

            $('.gear-slot').each(function(k, v) {
                resetGearslotItem($(v).attr('data-type'), $(v).attr('data-item'));
            });
            
            $("#calculator-section").slideDown("fast");
        });

        $("#player-class-section").slideDown();

        $(document).on('click', '.item-choose', function() {
            var item_type = $(this).attr('data-type'),
                item_name = $(this).attr('data-item'),
                item_itemset = $(this).attr('data-itemset'),
                item_no = $(this).attr('data-itemno'),
                level = $(this).attr('data-enh');

            $('#gearlist').modal("hide");

            addItem(item_name, item_type, item_itemset, item_no, level);
        });

        $("#equipment .gear-slot").click(function() {
            var list = $('<div/>'),
                item_type = $(this).attr('data-type'),
                item_itemset = $(this).attr('data-itemset'),
                item_no = $(this).attr('data-item'),
                items_db = BDOdatabase.items[item_itemset],
                items_list = (typeof items_db[player_class] === "undefined" ? items_db : items_db[player_class]),
                c = 1;

            // reset the modal body
            $('#gearlist .modal-body .row').html('');

            for (var key in items_list) {
                if (!items_list.hasOwnProperty(key)) {
                     continue;
                }

                var item = items_list[key],
                    selected = false;

                if ($.inArray(item_type, ["ring", "earring"]) !== -1) {
                    if (BDOcalculator.gear[item_type + "s"][item_no].item_name === key) {
                        selected = true;
                    }
                } else {
                    if (BDOcalculator.gear[item_type].item_name === key) {
                        selected = true;
                    }
                }

                generateItemPlate(item, item_type, item_itemset, item_no, key, c, selected).appendTo('#gearlist .modal-body .row');

                if (c % 2 === 0) {
                    $('<div class="clearfix"></div>').appendTo('#gearlist .modal-body .row');
                }

                c++;
            }

            $(".item-enhancement-slider").each(function(k, v) {
                if ($(v).attr('data-slider-max') === "0") {
                    $(v).replaceWith('<div>None</div>');
                } else {
                    $(v).slider({
                        tooltip_position: "bottom",
                        formatter: function(value) {
                            return '+' + value;
                        }
                    }).on("change", function(e) {
                        var itemPlate = $(e.target).closest('.item-details'),
                            button = $(e.target).closest('.item-details').find('.item-choose'),
                            item_key = button.attr('data-item'),
                            item_type = button.attr('data-type'),
                            item_itemset = button.attr('data-itemset'),
                            item_no = button.attr('data-itemno'),
                            items_db = BDOdatabase.items[item_itemset],
                            item = (typeof items_db[player_class] === "undefined" ? items_db : items_db[player_class]);
                            item = item[item_key];

                        // set the enhancement value
                        button.attr('data-enh', e.value.newValue);

                        // item effects
                        var stat_element = $('<div class="item-effects"/>');
                        stat_element.append('<strong>Item Effects</strong>');

                        if (Object.keys(item.item_effects).length > 0) {
                            for (var stat_key in item.item_effects) {
                                if (!item.item_effects.hasOwnProperty(stat_key)) {
                                     continue;
                                }

                                if (stat_key === "special") {
                                    stat_element.append('<strong>' + BDOdatabase.stats[stat_key].title + ':</strong><div>' + item.item_effects.special + '</div>');
                                } else {
                                    if (typeof BDOdatabase.stats[stat_key] === 'boolean') {
                                        stat_element.append('<div>' + BDOdatabase.stats[stat_key].title + BDOdatabase.stats[stat_key].symbol + '</div>');
                                    } else {
                                        stat_element.append('<div>' + BDOdatabase.stats[stat_key].title + ' ' + BDOcalculator.getItemStat(item, stat_key, true, e.value.newValue) + BDOdatabase.stats[stat_key].symbol + '</div>');
                                    }
                                }
                            }
                        } else {
                            stat_element.append('<div>None.</div>');
                        }

                        itemPlate.find('.item-effects').replaceWith(stat_element);

                        // item stats
                        stat_element = $('<div class="item-stats"/>');

                        if (typeof item.ap !== 'undefined') {
                            stat_element.append('<div>AP: ' + BDOcalculator.getItemStat(item, "ap", false, e.value.newValue) + '</div>');
                        }
                        if (typeof item.ap_min !== 'undefined') {
                            stat_element.append('<div>AP: ' + BDOcalculator.getItemStat(item, "ap_min", false, e.value.newValue) + '~' + BDOcalculator.getItemStat(item, "ap_max", false, e.value.newValue) + '</div>');
                        }
                        if (typeof item.dp !== 'undefined') {
                            stat_element.append('<div>DP: ' + BDOcalculator.getItemStat(item, "dp", false, e.value.newValue) + '</div>');
                        }

                        itemPlate.find('.item-stats').replaceWith(stat_element);
                    });
                }
            });

            $('#gearlist').modal();
        });

        $("#equipment .gem-slot").click(function() {
            var list = $('<div/>'),
                item_type = $(this).attr('data-type'),
                item_no = $(this).attr('data-item'),
                items_list = $.extend({}, BDOdatabase.gems.all, BDOdatabase.gems[item_type]),
                c = 1;

            // reset the modal body
            $('#gearlist .modal-body .row').html('');

            for (var key in items_list) {
                if (!items_list.hasOwnProperty(key)) {
                     continue;
                }

                var item = items_list[key],
                    selected = false;

                if (BDOcalculator.gear[item_type].gems[item_no].gem_name === key) {
                    selected = true;
                }

                generateGemItemPlate(item, item_type, item_no, key, c, selected).appendTo('#gearlist .modal-body .row');

                if (c % 2 === 0) {
                    $('<div class="clearfix"></div>').appendTo('#gearlist .modal-body .row');
                }

                c++;
            }

            $('#gearlist').modal();
        });

        //Copy share link to clipboard / tooltip setup
        var cb = new Clipboard('#copy-button');

        // Initialize the tooltip.
        $('#copy-button').tooltip();

        $('#copy-button').bind('click', function() {
            $('#copy-button').trigger('copied', ['Copied!']);
        });

        // Handler for updating the tooltip message.
        $('#copy-button').bind('copied', function(event, message) {
            $(this).attr('title', message)
            .tooltip('fixTitle')
            .tooltip('show')
            .attr('title', "Copy Link")
            .tooltip('fixTitle');
        });
    });
})(jQuery);