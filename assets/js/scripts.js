let date = new Date();
let itemCount = 1;
let lastBox = "";
let printedAtLeasOnce = false;

// ---

window.onbeforeprint = function () {
    let previewDiv = document.getElementById("section-to-print");
    previewDiv.classList.remove('d-none');
};

window.onafterprint = function () {
    let previewDiv = document.getElementById("section-to-print");
    previewDiv.classList.add('d-none');
};

window.onbeforeunload = function () {
    return 'Are you sure you want to leave?';
};

// ---

async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (e) {
            console.log("SW Registration error:", e);
        }
    }
}

window.onload = function () {
    registerSW();
}

// ---

$(function () {
    $('#printed_date').datetimepicker({
        locale: 'en',
        format: 'MM/DD/YYYY',
        defaultDate: date,
        ignoreReadonly: true,
        icons: {
            'time': 'fas fa-clock'
        }
    });

    $('#printed_date_xs').val(moment(date).format('YYYY-MM-DD').toString());

    date.setDate(date.getDate() + 120);

    let item1_exp_date = $('#item1_exp_date');

    item1_exp_date.datetimepicker({
        locale: 'en',
        format: 'MM/DD/YYYY',
        minDate: date,
        buttons: {
            showClear: true
        },
        icons: {
            clear: 'fas fa-backspace'
        }
    });

    item1_exp_date.find("input").val('');

    $('#item1_exp_date_xs').attr("min", moment(date).format('YYYY-MM-DD').toString());

    $("#printed_date_xs").change(function () {
        $('#printed_date').datetimepicker('date', moment($(this).val()))
    });

    $('#shipment_id').change(function () {
        if ($(this).val().indexOf("/") >= 0) {
            $(this).focus();
            alert('A shipment ID can not contain a "/"');
            return false;
        }

        document.title = $(this).val() + ' - PDF417 Barcode Generator';
    });
});

// ---

function addItem() {
    itemCount++;

    var newItem = document.createElement('div');
    newItem.setAttribute("id", 'item' + itemCount);
    newItem.classList.add('row');

    newItem.innerHTML =
        '<div class="col-4 col-lg-4 pr-0">' +
        '<div class="form-group">' +
        '<input type="hidden" class="form-control" id="item' + itemCount + '_id" value="' + itemCount + '">' +
        '<input type="text" class="form-control" id="item' + itemCount + '_fnsku" placeholder="FNSKU">' +
        '</div>' +
        '</div>' +
        '<div class="col-5 col-lg-4 pr-0 pl-1 pl-md-3">' +
        '<div class="input-group date pb-3 d-none d-md-flex" id="item' + itemCount + '_exp_date" data-target-input="nearest">' +
        '<input type="text" class="form-control datetimepicker-input" data-target="#item' + itemCount + '_exp_date" placeholder="Expiration Date">' +
        '<div class="input-group-append" data-target="#item' + itemCount + '_exp_date" data-toggle="datetimepicker">' +
        '<div class="input-group-text"><i class="fa fa-calendar"></i></div>' +
        '</div>' +
        '</div>' +
        '<div class="d-block d-md-none">' +
        '<input id="item' + itemCount + '_exp_date_xs" type="date" class="form-control" placeholder="Exp. Date">' +
        '</div>' +
        '</div>' +
        '<div class="col-3 col-lg-4 pl-1 pl-md-3">' +
        '<div class="form-group">' +
        '<input type="number" class="form-control" id="item' + itemCount + '_quantity" min="0" step="1" placeholder="Quantity">' +
        '</div>' +
        '</div>';


    let itemsDiv = document.getElementById("items");
    itemsDiv.appendChild(newItem);

    let itemCountExpDate = $('#item' + itemCount + '_exp_date');

    itemCountExpDate.datetimepicker({
        locale: 'en',
        format: 'MM/DD/YYYY',
        minDate: date,
        buttons: {
            showClear: true
        },
        icons: {
            clear: 'fas fa-backspace'
        }
    });
    itemCountExpDate.find("input").val('');

    $('#item' + itemCount + '_exp_date_xs').attr("min", moment(date).format('YYYY-MM-DD').toString());
}

function clearBox() {
    if (confirm('The boxes content is going to be deleted. Are you sure?')) {
        // do nothing and the box will be cleared
    } else {
        return false;
    }

    let itemsDiv = document.getElementById("items");
    itemsDiv.innerHTML = "";

    itemCount = 0;
    addItem();
}

function generateBarcode() {
    let canvas = document.getElementById("barcode");

    let shipmentId = $('#shipment_id');
    let shipment = shipmentId.val().trim().toUpperCase();

    if (shipment.length < 6) {
        alert('Please enter a valid FBA Shipment ID.');
        shipmentId.focus();
        return false;
    }
    let barcodeShipment = document.getElementById("barcode_shipment_id");
    barcodeShipment.innerHTML = shipment;


    let destination = $('#destination').val().trim().toUpperCase();
    let barcodeDestination = document.getElementById("barcode_destination");
    barcodeDestination.innerHTML = destination;

    let printedDate = $('#printed_date').find("input").val();
    let barcodeDate = document.getElementById("barcode_date");
    barcodeDate.innerHTML = '<b>Printed On ' + printedDate + '</b>';

    let items = [];
    let itemsHTML = [];
    let fnskArray = [];

    for (let i = 1; i <= itemCount; i++) {
        let itemFnsku = $('#item' + i + '_fnsku');
        let fnsku = itemFnsku.val().trim().toUpperCase();

        var valid = /[A-Z][0-9][0-9]/;
        if (fnsku.length <= 0) {
            continue;
        }

        if (fnsku.length < 8 || fnsku.length > 10 || valid.test(fnsku) === false) {
            alert('Please check the SKU. It does not seem to be a valid FNSKU.');
            itemFnsku.focus();
            return false;
        }

        fnskArray.push(fnsku);

        let itemQuantity = $('#item' + i + '_quantity');
        let quantity = itemQuantity.val();
        if (quantity.length <= 0) {
            alert('Please check the Quantity of item ' + fnsku + '. It does not seem to be a valid value.');
            itemQuantity.focus();
            return false;
        }

        let itemString = "FNSKU:" + fnsku + ",QTY:" + quantity;
        let itemStringHTML = "<strong>FNSKU:</strong>" + fnsku + "<strong>, QTY:</strong>" + quantity;

        let expDate = $('#item' + i + '_exp_date').find("input").val();
        if (expDate.length <= 0) {
            expDate = $('#item' + i + '_exp_date_xs').val();
        }

        if (expDate.length > 0) {

            itemString += ",EXP:" + moment(expDate).format('MMDDYY').toString();
            itemStringHTML += "<strong>, EXP:</strong>" + moment(expDate).format('MMDDYY').toString();
        }

        items.push(itemString);
        itemsHTML.push(itemStringHTML);
    }

    if (fnskArray.length <= 0) {
        alert('The box is empty. Please start filling it.');
        $('#item1_fnsku').focus();
        return false;
    }

    if (hasDuplicates(fnskArray)) {
        alert('Please use one row per unique item. You have two or more rows with the same FNSKU.');
        return false;
    }

    text = items.join(',').toString();
    textHTML = itemsHTML.join('<strong>, </strong>').toString();

    if (lastBox === text) {
        if (confirm('This boxes contents is the same as last printed label. If you are not reprinting the last label, press Yes (or OK). If you are reprinting the label of the last box, press NO (or Cancel).')) {
            return false;
        } else {
            // do nothing and the same box id will be printed
        }
    } else {
        lastbox = text;
    }

    textHTML = "<strong>AMZN,PO:</strong>" + shipment + "<strong>, </strong>" + textHTML;
    let barcodeCode = document.getElementById("barcode_code");
    barcodeCode.innerHTML = textHTML;

    lastBox = text;
    text = "AMZN,PO:" + shipment + "," + text;
    PDF417.draw(text, canvas, 2.666, 6, 3);

    let image = document.getElementById('barcode_image');
    image.src = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    // printing

    setTimeout(() => {
        printedAtLeasOnce = true;
        window.print();
    }, 500);
}

function reprintBarcode() {
    if (printedAtLeasOnce === false) {
        alert('There is no Last Label to be Reprinted. Please use the "Print Box Label" button!');
        return false;
    }

    // if (confirm('Do you want to Reprint Last Label?')) {
    //     // do nothing and the last label will be printed
    // } else {
    //     return false;
    // }

    window.print();
}

function hasDuplicates(array) {
    var valuesSoFar = Object.create(null);
    for (var i = 0; i < array.length; ++i) {
        var value = array[i];
        if (value in valuesSoFar) {
            return true;
        }
        valuesSoFar[value] = true;
    }
    return false;
}

