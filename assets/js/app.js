/*
* @Author: SirMrE
* @http: http://www.sirmre.com/bdo-calculator
* @Copyright: (c) 2016 Mark Eliasen
* @license: May be freely distributed under the CC BY-NC 3.0 License 
*           (https://creativecommons.org/licenses/by-nc/3.0/)
* @Date:   2016-04-07 20:53:22
* @Last Modified by:   SirMrE
* @Last Modified time: 2016-04-11 23:56:22
*/

/* global BDOdatabase, BDOcalculator */
/* jshint -W038, unused: false */

(function ($) {
    "use strict";

    var player_class = "";

    // version 0.2.0
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
        $("#equipment div[data-type='" + item_type + "']" + (typeof item_no === 'undefined' ? '' : "[data-item='" + item_no + "']")).attr('style', '');
    }

    function setGearslotItem (item, item_type, item_no) {
        $("#equipment div[data-type='" + item_type + "']" + (item_no === 'undefined' ? '' : "[data-item='" + item_no + "']")).css({
            'border-color': BDOdatabase.rarities[item.rarity],
            'background': 'url(assets/images/48/' + ($.inArray(item_type, ["main-weapon", "secondary-weapon"]) === -1 ? item_type : BDOdatabase.class_weapons[player_class][item_type].replace(' ', '-').toLowerCase()) + '.png) no-repeat center center'
        });
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
        item_element.append('<button class="btn btn-sm btn-primary item-choose" data-enh="0" data-item="' + key + '" data-itemset="' + item_itemset + '" data-type="' + item_type + '" data-itemno="' + item_no + '">Choose</button>');

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
                    stat_element.append('<div>' + BDOdatabase.stats[stat_key].title + ' ' + BDOcalculator.getItemStat(item, stat_key, true, enhancement_level) + '' + BDOdatabase.stats[stat_key].symbol + '</div>');
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
            var effect_string = '';

            if (typeof BDOdatabase.set_effects[item.set].combos !== 'undefined') {

                for (var combos_key in BDOdatabase.set_effects[item.set].combos) {
                    if (!BDOdatabase.set_effects[item.set].combos.hasOwnProperty(combos_key)) {
                         continue;
                    }

                    var combos = BDOdatabase.set_effects[item.set].combos[combos_key];

                    for (var combo_eff_key in combos.effects) {
                        if (!combos.effects.hasOwnProperty(combo_eff_key)) {
                             continue;
                        }

                        effect_string += (effect_string === '' ? '<div><span>' + ucWords(combos.pieces.join(' + ')) + ':</span> ' : ' & ') + BDOdatabase.stats[combo_eff_key].title + ' +' + combos.effects[combo_eff_key] + '' + BDOdatabase.stats[combo_eff_key].symbol;
                    }

                    stat_element.append(effect_string + '</div>');
                }
            }

            if (typeof BDOdatabase.set_effects[item.set].pieces !== 'undefined') {

                for (var pieces_key in BDOdatabase.set_effects[item.set].pieces) {
                    if (!BDOdatabase.set_effects[item.set].pieces.hasOwnProperty(pieces_key)) {
                         continue;
                    }

                    var pieces_effects = BDOdatabase.set_effects[item.set].pieces[pieces_key];
                        effect_string = '';

                    for (var set_eff_key in pieces_effects) {
                        if (!pieces_effects.hasOwnProperty(set_eff_key)) {
                             continue;
                        }

                        effect_string += (effect_string === '' ? '<div><span>' + pieces_key + '-Pieces:</span> ' : ' & ') + BDOdatabase.stats[set_eff_key].title + ' +' + pieces_effects[set_eff_key] + '' + BDOdatabase.stats[set_eff_key].symbol;
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
                                '<div>' + (typeof item.enhancement_effects === 'undefined' ? 'Info Missing..' : item.enhancement_effects) + '</div>'+
                            '</div>');

        // item icon
        item_element.append('<div class="item-enhancement-level">'+
                                '<strong>Enhancement Level:</strong>'+
                                '<input data-slider-min="" data-slider-max="' + getEnhancementMax(item) + '" data-slider-value="' + enhancement_level + '" class="item-enhancement-slider">'+
                            '</div>');

        return item_element;
    }

    $(document).ready(function() {
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

        $('#player-class').select2({
            width: '100%',
            data: (typeof $('#player-class').attr('placeholder') === 'undefined' ? BDOdatabase.classes : [$('#player-class').attr('placeholder')].concat(BDOdatabase.classes))
        });

        $("#player-class-section").slideDown();

        $(document).on('click', '.item-choose', function() {
            var item_type = $(this).attr('data-type'),
                item_itemset = $(this).attr('data-itemset'),
                item = BDOdatabase.items[item_itemset],
                item_no = $(this).attr('data-itemno'),
                level = $(this).attr('data-enh');

            $('#gearlist').modal("hide");

            if ($.inArray(item_type, ["main-weapon", "secondary-weapon"]) !== -1) {
                item = item[player_class.toLowerCase()];
            }

            item = item[$(this).attr('data-item')];
            setGearslotItem(item, item_type, item_no);

            BDOcalculator.setGear(item, item_type, item_no, $(this).attr('data-item'), function() {
                BDOcalculator.setEnchantmentLevel(item_type, item_no, level, function() {
                    BDOcalculator.calculate();
                });
            });
        });

        $("#equipment .gear-slot").click(function() {
            var list = $('<div/>'),
                item_type = $(this).attr('data-type'),
                item_itemset = $(this).attr('data-itemset'),
                item_no = $(this).attr('data-item'),
                items_db = BDOdatabase.items[item_itemset],
                items_list = (typeof items_db[player_class] === "undefined" ? items_db : items_db[player_class]),
                c = 1;

            if (typeof items_db.all !== "undefined") {
                items_list = items_list.concat(items_db.all);
            }

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
                    }).on("slideStop", function(e) {
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
                        button.attr('data-enh', e.value);

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
                                    stat_element.append('<div>' + BDOdatabase.stats[stat_key].title + ' ' + BDOcalculator.getItemStat(item, stat_key, true, e.value) + '' + BDOdatabase.stats[stat_key].symbol + '</div>');
                                }
                            }
                        } else {
                            stat_element.append('<div>None.</div>');
                        }

                        itemPlate.find('.item-effects').replaceWith(stat_element);

                        // item stats
                        stat_element = $('<div class="item-stats"/>');

                        if (typeof item.ap !== 'undefined') {
                            stat_element.append('<div>AP: ' + BDOcalculator.getItemStat(item, "ap", false, e.value) + '</div>');
                        }
                        if (typeof item.ap_min !== 'undefined') {
                            stat_element.append('<div>AP: ' + BDOcalculator.getItemStat(item, "ap_min", false, e.value) + '~' + BDOcalculator.getItemStat(item, "ap_max", false, e.value) + '</div>');
                        }
                        if (typeof item.dp !== 'undefined') {
                            stat_element.append('<div>DP: ' + BDOcalculator.getItemStat(item, "dp", false, e.value) + '</div>');
                        }

                        itemPlate.find('.item-stats').replaceWith(stat_element);
                    });
                }
            });

            $('#gearlist').modal();
        });
    });
})(jQuery);