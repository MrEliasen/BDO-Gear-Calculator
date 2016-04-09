/*
* @Author: SirMrE
* @http: http://www.sirmre.com/bdo-calculator
* @Copyright: (c) 2016 Mark Eliasen
* @license: May be freely distributed under the CC BY-NC 3.0 License 
*           (https://creativecommons.org/licenses/by-nc/3.0/)
* @Date:   2016-04-07 20:53:22
* @Last Modified by:   SirMrE
* @Last Modified time: 2016-04-09 18:53:04
*/

/* global BDOdatabase, BDOcalculator */
/* jshint unused: false */

(function ($) {
    "use strict";

    var player_class = "";

    /**
     * Checks if data is an array or not
     * @param  {mixed}  data  The data to check.
     * @return {Boolean}
     */
    function isArray(data) {
        return (Object.prototype.toString.call(data) === "[object Array]");
    }

    /**
     * Initiates a select2 dropdown with the data from the list provided.
     * @param  {string/obejct}  element  the identifier for the drop down element.
     * @param  {array/object}   list     the array or object containing the data to add to the drop down list
     * @param  {Function}       callback the callback function to run once complete.
     * @return {void} 
     */
    function initDropDown (element, list, callback, customClass) {
        callback = (typeof callback === "function" ? callback : function() {});
        customClass = (typeof customClass === 'undefined' ? '' : customClass);
        var dropdown_list = [];

        if (isArray(list)) {
            dropdown_list = list;
        } else {
            for (var key in list) {
                if (!list.hasOwnProperty(key)) {
                     continue;
                }

                dropdown_list.push(key);
            }
        }

        if (typeof element === "string") {
            element = $(element);
        }

        element.select2({
            width: '100%',
            data: (typeof element.attr('placeholder') === 'undefined' ? dropdown_list : [element.attr('placeholder')].concat(dropdown_list))
        });

        callback();
    }

    $(document).ready(function() {
        // initiate the player classes dropdown and show the menu once complete.
        initDropDown("#player-class", BDOdatabase.classes, function() {
            $("#player-class-section").slideDown();
        });

        // when a user selects a class, we initiate the equipment dropdowns based on class, hides the classes menu and shows the equipment selection menu.
        $("#player-class").on("change", function() {
            var total = $("#calculator-section select").length - 1;
            player_class = $(this).val().toLowerCase();

            $(this).slideUp("fast", function() {
                $("#calculator-section select").each(function(k,v) {
                    var element = $(v), drop_list, item_list;

                    if (element.parent('div').hasClass('enhancement')) {
                        initDropDown(
                            element,
                            Array.apply(
                                null,
                                {
                                    length: ($.inArray(element.attr("data-type"), ["rings", "earrings", "belt", "necklace"]) === -1 ? BDOdatabase.max_gear_enhancement : BDOdatabase.max_acc_enhancement) + 1
                                }
                            ).map(Number.call, Number)
                        );
                    } else {
                        item_list = BDOdatabase.items[element.attr("data-itemset")];
                        drop_list = (typeof item_list[player_class] === "undefined" ? item_list : item_list[player_class]);

                        if (typeof item_list.all !== "undefined") {
                            drop_list = drop_list.concat(item_list.all);
                        }

                        initDropDown(element, drop_list);
                    } 

                    if (total === k) {
                        BDOcalculator.init();
                        BDOcalculator.calculate();
                        $("#calculator-section").slideDown("fast");
                    }
                });
            });
        });

        $("#calculator-section div:not(.enhancement) > select").on('change', function() {
            var item = BDOdatabase.items[$(this).attr('data-itemset')],
                type = $(this).attr('data-type'),
                item_no = $(this).attr('data-item');

            if ($.inArray(type, ["main-weapon", "secondary-weapon"]) !== -1) {
                item = item[player_class.toLowerCase()];
            }

            item = item[$(this).val()];

            BDOcalculator.setGear(item, type, item_no, 0, function() {
                BDOcalculator.calculate();
            });
        });

        $("#calculator-section div.enhancement > select").on('change', function() {
            var level = $(this).val(),
                type = $(this).attr('data-type'),
                item_no = $(this).attr('data-item');

            BDOcalculator.setEnchantmentLevel(type, item_no, level, function() {
                BDOcalculator.calculate();
            });
        });
    });
})(jQuery);