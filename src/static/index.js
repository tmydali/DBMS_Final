/*** Initialize ***/
$('#result-alert').hide()

// Get tables
$.ajax({
    type: "POST",
    url: '/database', 
    data: JSON.stringify({ method: 'get-tables' }),
    success: (data) => {
        if(data.method == 'success')
            for(let item of data.data)
                $('#table-dropdown').append(`<a class="dropdown-item" href="#">${item}</a>`);
    },
    contentType: "application/json",
    dataType: 'json'
});

// Get all districts
$.ajax({
    type: "POST",
    url: '/database', 
    data: JSON.stringify({ method: 'get-all-districts' }),
    success: (data) => {
        if(data.method == 'success') {
            data.data[0] = '所有行政區';
            for(let item of data.data)
                $('#lot-dropdown-district-ops').append(`<a class="dropdown-item" href="#">${item}</a>`);
        }
    },
    contentType: "application/json",
    dataType: 'json'
});

// Get all land use
$.ajax({
    type: "POST",
    url: '/database', 
    data: JSON.stringify({ method: 'get-all-landuse' }),
    success: (data) => {
        if(data.method == 'success') {
            data.data[0] = '所有土地利用';
            for(let item of data.data)
                $('#lot-dropdown-plan-ops').append(`<a class="dropdown-item" href="#">${item}</a>`);
        }
    },
    contentType: "application/json",
    dataType: 'json'
});

/*** Button Binding ***/
// SQL direct query
$('#SQL-btn').click( () => {
    let text = $('#SQLTextArea').val();
    let json = {
        method: 'sql-query',
        data: text
    };
    $.ajax({
        type: "POST",
        url: '/database',
        data: JSON.stringify(json),
        success: (obj) => {handle_result(obj)},
        contentType: "application/json",
        dataType: 'json'
    });
});

// Button query "SELECT"
$('body').on('click', '#table-dropdown a', function(event) {
    let text = $(this).text();
    let json = {
        method: 'get-table-data',
        data: text
    };
    $.ajax({
        type: "POST",
        url: '/database', 
        data: JSON.stringify(json),
        success: (data) => { handle_result(data); },
        contentType: "application/json",
        dataType: 'json'
    });
    $('#table-dropdown-btn').html(text);
});

// Nav tabs
$('.nav-tabs li a').on('click', () => {
    $('#table-dropdown-btn').html('選取資料表');
    $('#lot-dropdown-district').html('所有行政區');
    $('#lot-dropdown-plan').html('所有土地利用');
    $('#trade-dropdown').html('近三年各區交易統計');
});

// District dropdown
$('body').on('click', '#lot-dropdown-district-ops a', function() {
    $('#lot-dropdown-district').html($(this).text());
});

// Land use dropdown
$('body').on('click', '#lot-dropdown-plan-ops a', function() {
    $('#lot-dropdown-plan').html($(this).text());
});

// Trade dropdown
$('body').on('click', '#trade-dropdown-ops a', function() {
    $('#trade-dropdown').html($(this).text());
});

// Button query TRADE
$('#query-trade-btn').click(function() {
    let text = $('#trade-dropdown').text();
    console.log(text);
    let json = {
        method: 'get-trade-data',
        data: text
    };
    $.ajax({
        type: "POST",
        url: '/database', 
        data: JSON.stringify(json),
        success: (data) => { handle_result(data); },
        contentType: "application/json",
        dataType: 'json'
    });
});

// Button query BUILDING
$('body').on('click', '#query-building-btn', function(event) {
    let In = $('input[name="lot-in-ops"]:checked').val();
    let belong = $('input[name="lot-belong-ops"]:checked').val();
    let near = $('#lot-near-metro').find('input:checked').length;
    let district = $('#lot-dropdown-district').text();
    let landuse = $('#lot-dropdown-plan').text();
    let json = {
        method: 'get-building-data',
        data: [In, belong, near, district, landuse]
    };
    $.ajax({
        type: "POST",
        url: '/database', 
        data: JSON.stringify(json),
        success: (data) => { handle_result(data); },
        contentType: "application/json",
        dataType: 'json'
    });
});

/*** Functions ***/
function handle_result(obj) {
    let method = obj.method;
    let data = obj.data;
    if(method == 'success') {
        let html = '';
        // Header
        html += '<thead><tr>';
        for(let header of data[0]) {
            html += `<th scope="row">${header}</th>`;
        }
        html += '</tr></thead>';
        // Data
        html += '<tbody>';
        for(let row of data.slice(1)) {
            html += '<tr>';
            for(let item of row) {
                html += `<td>${item}</th>`;
            }
            html += '</tr>';
        }
        html += '</tbody>';
        $('#show-table').html(html);
        $('#result-alert').attr('class', 'alert alert-success').html("Query success!").show();
    }
    else if (method == 'fail') {
        $('#show-table').html('');
        $('#result-alert').attr('class', 'alert alert-danger').html("Query fail!").show();
    }
}