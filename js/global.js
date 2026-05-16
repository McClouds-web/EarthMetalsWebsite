$(document).ready(function() {
	$(document).ajaxStart(function(){
	    $('.ajax-loading').show();
	});

	$(document).ajaxStop(function(){
	    $('.ajax-loading').hide();
	});

	$(document).on('click','[rel^=Vehicle_reserve_price].editable-click',function() {
	    $('.editable-input').children('input').val($('.editable-input').children('input').val().replace("R ","").replace(" ","")).trigger('change');
	});

	$('input, textarea').placeholder();

	$(".navbar li").click(function(e) {
		if($(this).hasClass('open')) {
			e.stopPropagation();
			$(this).removeClass('open');
			$(this).children('.dropdown-toggle').next('.dropdown-menu').css('display','none');

		}else {
			e.stopPropagation();
			$(this).addClass('open');
			$(this).children('.dropdown-toggle').next('.dropdown-menu').css('display','block');
		}
	});


	$(".dropdown-menu").hover(function() {
		$(this).css('display','block');
	},function() {
		$('.dropdown').removeClass('open');
		$(this).css('display','none');
	});

    $.fn.splitField = function(digits = 7) {
    	var value = [];
    	//Remove spaces
    	var numerical_value = $(this).val().replace(/\s/g, '');
		var empty_values_sum = digits-numerical_value.length;

		for (var i = 0, len = digits; i < len; i ++) {
			if(i < empty_values_sum) {
				value.push("");
			}else {
				value.push(numerical_value.charAt(i-empty_values_sum));
			}
		}

		function phone_split(phoneId){
			var result = '';
			var i = 0;
			var html_split = '<span class="currency-symbol">R</span>&nbsp;';
			do {
				i += 1;
				html_split += `<input type="number" name="${phoneId}[]" id="${phoneId}${i}" class="inp_small" pattern="[0-9]*" oninput="limitinput(this);" value size="1" maxlength="1" tabindex="${i-1}" />`;
				if (digits != 5 && (i == 1 || i == 4)) {
					html_split += '<span class="sep_phone"> , </span>';
				}
				result += i + ' ';
			}
			while (i > 0 && i < digits);
			return html_split;
		}

        this.each(function() {
            var $this = $(this);
            if (!($this.is(':text') || $this.is(':hidden'))) { return; }
            var tabIndex = $this.attr("tabindex") ? $this.attr("tabindex") : 1;

            //Custom new fields
            var $wrapper = $('<div dir="ltr" style="display: inline-block;">' + phone_split($this.attr("id")) + '</div>');
            var $arrInput = $wrapper.find("input").on('keyup', function (e) {
                if (this.value.length == this.maxLength && e.which != 9) {
                    $(this).nextAll('input').first().focus();
                }
                if ((e.which == 8 || e.which == 46) && $(this).val() =='') {
                	$(this).prevAll('input').first().focus();
                }
            }).focus(function() { $(this).select(); } );

            $arrInput.each(function(){
                $(this).attr("tabindex", tabIndex++) }).bind("keyup", function(){
                let value = '';
                let i = 0;
                do {
                	value += $arrInput[i].value;
                	i += 1;
                }
                while (i > 0 && i < digits);
                $this.val(value);
                });
                
            $wrapper.insertBefore($this);

            //hide fields
            $this.attr("Type", "hidden").removeAttr("tabindex").hide();
        });

        return this;
    };

    $('.nav .networks a').each(function(link) {
        $(link).on('click', function (event) {
            event.preventDefault(); // Prevent the default navigation
            const href = link.attr('href');
            // Use Vue Router to navigate
            window.vueApp.$router.push(href).catch(function (err) {
                // Ignore navigation errors (e.g., if the user is already on the route)
                if (err.name !== 'NavigationDuplicated') {
                    throw err;
                }
            });

            return false;
        });
    });
});

// Centralised helpers for note modals/forms
// Keeps submit flag handling consistent across pages that post notes
// Usage examples:
// NoteHelpers.submit('#note-modal', { wa: 1 });
// NoteHelpers.finish('#note-modal', { afterHide: filterme, gridId: 'valuation-grid' });
(function (w, $) {
    const resolveForm = function (target, formSelector) {
        const $target = $(target);
        if (!$target.length) {
            return $();
        }

        if ($target.is('form')) {
            return $target;
        }

        if (formSelector) {
            const explicit = $target.find(formSelector);
            if (explicit.length) {
                return explicit;
            }
        }

        const nestedForm = $target.find('form');
        if (nestedForm.length) {
            return nestedForm;
        }

        return $();
    };

    const getSubmitFlag = function (form) {
        return form.find('.submitval, input[name="addnote"]').first();
    };

    const setSubmitFlag = function (form, value) {
        const flag = getSubmitFlag(form);
        if (flag.length) {
            flag.val(value);
        }
    };

    const hasScopedNoteField = function (form) {
        return form.find([
            '[name="vehicle_id"]',
            '[name="fineId"]',
            '[name="stock_inventory_id"]',
            '[name="systemaccountid"]',
        ].join(',')).filter(function () {
            return !!$(this).val();
        }).length > 0;
    };

    const isSameOriginAction = function (form) {
        const action = form.attr('action');
        if (!action) {
            return true;
        }

        const parser = document.createElement('a');
        parser.href = action;

        if (!parser.host) {
            return true;
        }

        return parser.protocol === window.location.protocol && parser.host === window.location.host;
    };

    w.NoteHelpers = {
        setFlag(target, value, formSelector = null) {
            const form = resolveForm(target, formSelector);
            if (!form.length) {
                return;
            }
            setSubmitFlag(form, value);
        },

        submit(target, options = {}) {
            const { wa = null, formSelector = null, requireScope = true } = options;
            const form = resolveForm(target, formSelector);
            if (!form.length) {
                return;
            }

            // Client-side helpers should only submit recognised note forms.
            // Tenant isolation is still enforced server-side by the target action.
            if (!getSubmitFlag(form).length || !isSameOriginAction(form)) {
                console.warn('NoteHelpers.submit aborted: unrecognised note form');
                return;
            }

            if (requireScope && !hasScopedNoteField(form)) {
                console.warn('NoteHelpers.submit aborted: missing note scope field');
                return;
            }

            setSubmitFlag(form, 1);

            if (wa !== null) {
                const waField = form.find('[name="wa_notification"]');
                if (waField.length) {
                    waField.val(wa);
                }
            }

            form.trigger('submit');
        },

        finish(target, options = {}) {
            const {
                successMessage = 'Note Saved!',
                gridId = null,
                afterHide = null,
                delay = 500,
                formSelector = null,
                bodySelector = '.modal-body',
            } = options;

            const form = resolveForm(target, formSelector);
            setSubmitFlag(form, 0);

            const modal = $(target);
            const modalBody = modal.find(bodySelector);
            if (modalBody.length) {
                modalBody.find('.alert').first().remove();
                const alert = $('<div>', {
                    class: 'alert in alert-block fade alert-success',
                    text: successMessage,
                });
                modalBody.prepend(alert);
            }

            const modalFooter = modal.find('.modal-footer');
            if (modalFooter.length) {
                modalFooter.hide();
            }

            setTimeout(function () {
                if (modal.length && typeof modal.modal === 'function') {
                    modal.modal('hide');
                }

                if (modalFooter.length) {
                    modalFooter.show();
                }

                if (gridId) {
                    const grid = $(`#${gridId}`);
                    if (grid.length && grid.yiiGridView) {
                        grid.yiiGridView.update(gridId);
                    }
                }

                if (typeof afterHide === 'function') {
                    afterHide();
                }
            }, delay);
        },

        bindSave(buttonSelector, options = {}) {
            $(document).on('click', buttonSelector, function () {
                w.NoteHelpers.submit(options.modal || options.form || $(this).closest('.modal, form'), options);
            });
        },
    };
})(window, jQuery);

function checkDealAssist(element, vehicleId) {
    let checkbox = $(element);
    let isChecked = checkbox.is(":checked") ? 1 : 0;
    checkbox.attr("disabled", true);

    $.ajax({
        url: "/corporate/CorporateIsEligibleDealAssist",
        type: "POST",
        data: { id: vehicleId, eligible_for_deal_assist: isChecked },
        success: function () {
            $.notify("Successfully updated!", { className: "success", position: "top center" });
            checkbox.attr("disabled", false);
        },
        error: function () {
            $.notify("Failed to update. Please try again.", { className: "error", position: "top center" });
            checkbox.attr("disabled", false);
        }
    });
}


function limitinput(input) {
   if(input.value.length > input.maxLength) input.value = input.value.slice(0, input.maxLength);
}


var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();


/* Controls Nav - body height - DO-7440 */

function adjustBodyPadding() {
	const navbar = document.querySelector('.navbar');
	const navbarHeight = navbar.offsetHeight;
	document.body.style.paddingTop = navbarHeight + 'px';
}

// Run on load and resize
window.addEventListener('load', adjustBodyPadding);
window.addEventListener('resize', adjustBodyPadding);

// For dynamic content changes
const observer = new MutationObserver(adjustBodyPadding);

observer.observe(document.querySelector('.navbar'), {
	childList: true,
	subtree: true,
	attributes: true
});

function integerInput($this) {
    let value = $this.val();
    let cursorPos = this.selectionStart;
    const cleaned = value.replace(/\D+/g, '');
    if (value !== cleaned) {
        $this.val(cleaned);
    }
}

$('.integerInput').on('input', function() {
	let $this = $(this);
	let value = $this.val();
	let cursorPos = this.selectionStart;

	let cleaned = value.replace(/[^0-9]/g, '');

	if (value !== cleaned) {
		$this.val(cleaned);
		this.setSelectionRange(cleaned.length, cleaned.length);
	}
});

$('.decimalInput').on('input', function() {
	let $this = $(this);
	let value = $this.val();
	let cursorPos = this.selectionStart;

	let cleaned = value.replace(/[^0-9.]/g, '');

	let parts = cleaned.split('.');
	if (parts.length > 2) {
		cleaned = parts[0] + '.' + parts.slice(1).join('');
	}

	if (parts[1]) {
		cleaned = parts[0] + '.' + parts[1].substring(0, 2);
	}

	if (cleaned !== value) {
		$this.val(cleaned);
		this.setSelectionRange(cursorPos - (value.length - cleaned.length), cursorPos - (value.length - cleaned.length));
	}
});

function updateSecondaryRequired(interiorType, interiorSecondaryColour, form, message) {
    var interiorTypeSelect = $(interiorType).val();
    var form = $(form);
    var requiredTypes = [
        'CLOTHLEATHER',
        'TWOTONECLOTH',
        'TWOTONELEATHER',
        'TWOTONEVINYL'
    ];

    if (requiredTypes.includes(interiorTypeSelect)) {
        toggleFieldRequired(interiorSecondaryColour, true, message, form);
    } else {
        toggleFieldRequired(interiorSecondaryColour, false, '', form);
    }
}

function updateAccidentCommentsRequired(accidentField, accidentCommentsField, form, message) {
    let accidentValue = $(accidentField + ' input:checked').val();
    let formElement = $(form);

    if (accidentValue == 1) {
        toggleFieldRequired(accidentCommentsField, true, message, formElement);
    } else {
        toggleFieldRequired(accidentCommentsField, false, '', formElement);
    }
}

function toggleFieldRequired(fieldId, makeRequired, customMessage, form) {
    var settings = form.data('settings');
    if (!settings || !settings.attributes) return;

    // fieldId can be 'Interior_secondary_colour' or similar – this must
    // match attr.id exactly. Adjust this comparison if needed.
    var attr = settings.attributes.find(function(a) {
        return a.id === fieldId;
        // or: return a.inputID === fieldId;  // if you pass the inputID
    });
    if (!attr) return;

    var $label = $('label[for="' + attr.inputID + '"]');
    if ($label.length === 0) return;

    if (makeRequired) {
        attr.clientValidation = function(value, messages, attribute) {
            if ($.trim(value) === '') {
                var labelName = (attribute.name || '').replace(/[\[\]]/g, '');
                messages.push(customMessage || (labelName + " cannot be blank."));
            }
        };
        attr.validateOnChange = true;
        attr.validateOnBlur = true;

        if ($label.find('.required-indicator').length === 0) {
            $label.append('<span class="required-indicator"> *</span>');
        }
    } else {
        delete attr.clientValidation;
        attr.validateOnChange = false;
        attr.validateOnBlur = false;

        $label.find('.required-indicator').remove();
    }
}

function multiPageModalRun(url, params, modalId, modalBodyClass, show = false, requestType = "post", directParams = false) {
    if (show) {
        $('#' + modalId + " ." + modalBodyClass).html("");
        $('#' + modalId).modal();
        $('#' + modalId + " .modal-footer").show();
    }

    if (requestType === "post") {

        if (directParams) {
            $.post(url,
                params
                , function (data) {
                    $('#' + modalId + " ." + modalBodyClass).html(data);
                });
            return;
        }

        $.post(url, {
            params
        }, function (data) {
            $('#' + modalId + " ." + modalBodyClass).html(data);
        });
    }
    if (requestType === "get") {

        if (directParams) {
            $.get(url,
                params
                , function (data) {
                    $('#' + modalId + " ." + modalBodyClass).html(data);
                });
            return;
        }

        $.get(url, {
            params
        }, function (data) {
            $('#' + modalId + " ." + modalBodyClass).html(data);
        });
    }

}