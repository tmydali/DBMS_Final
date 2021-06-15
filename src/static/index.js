/*** Initialize ***/
$('#result-alert').hide();
$('#CRUD-btn-group').find('button').prop('disabled', true);
$('#exit-btn').hide();
let STATE = 'init';

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
    $('#CRUD-btn-group').find('button').prop('disabled', false);
    $('#show-table > tbody > tr:first').remove();
});

// Nav tabs
$('.nav-tabs li a').on('click', () => {
    $('#table-dropdown-btn').html('選取資料表');
    $('#lot-dropdown-district').html('所有行政區');
    $('#lot-dropdown-plan').html('所有土地利用');
    $('#trade-dropdown').html('近三年各區交易統計');
    $('#CRUD-btn-group').find('button').prop('disabled', true);
    $('#show-table > tbody > tr:first').remove();
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

// Button "create"
$('#create-btn').click(() => {
    STATE = 'insert';
    $('#result-alert').attr('class', 'alert alert-info').text('Adding new data...');
    let col_len = $('#show-table > tbody > tr:first').find('td').length - 1;
    let new_row = $('<tr class="table-active"/>');
    for(let i=0; i<col_len; i++) {
        if(i==0) new_row.append('<td>###</td>');
        new_row.append('<td><input type="text" class="form-control form-control-sm"></td>');
    }
    new_row.append('<td><button class="btn btn-sm btn-danger" type="button" id="create-commit-btn">＋</button></td>');
    new_row.prependTo('#show-table tbody');
    $('#CRUD-btn-group').find('button').prop('disabled', true);
    $('#exit-btn').show();
});

// Button create commit
$('body').on('click', '#create-commit-btn', function() {
    let data_collect = [];
    $(this).parent().parent().find('input').each(function() {
        data_collect.push($(this).val());
    });
    let json = {
        method: 'insert-into',
        data: {
            table: $('#table-dropdown-btn').text(),
            raw: data_collect
        }
    };

    $.ajax({
        type: "POST",
        url: '/database', 
        data: JSON.stringify(json),
        success: (data) => { handle_created(data); },
        contentType: "application/json",
        dataType: 'json'
    });
});

// Button "edit"
$('#edit-btn').click(() => {
    STATE = 'edit';
    $('#result-alert').attr('class', 'alert alert-info').text('Editing data...');
    $('#show-table').addClass('table-hover');
    $('#show-table').find('tr').click(onRowEditEvent);
    $('#CRUD-btn-group').find('button').prop('disabled', true);
    $('#exit-btn').show();
});

// Button edit commit
$('body').on('click', '#edit-commit-btn', function() {
    let data_collect = [];
    let row = $(this).parent().parent().find('td:first').text();
    $(this).parent().parent().find('input').each(function() {
        data_collect.push($(this).val());
    });
    let json = {
        method: 'update',
        data: {
            table: $('#table-dropdown-btn').text(),
            raw: data_collect,
            index: row
        }
    };

    $.ajax({
        type: "POST",
        url: '/database', 
        data: JSON.stringify(json),
        success: (data) => { handle_updated(data); },
        contentType: "application/json",
        dataType: 'json'
    });
});

// Button "delete"
$('#delete-btn').click(() => {
    STATE = 'delete';
    $('#result-alert').attr('class', 'alert alert-danger').text('Deleting data...');
    $('#show-table').addClass('table-hover');
    $('#show-table').find('tr').hover(onRowDeleteEvent);
    $('#CRUD-btn-group').find('button').prop('disabled', true);
    $('#exit-btn').show();
});

// Button delete commit
$('body').on('click', '#delete-commit-btn', function() {
    let row = $(this).parent().parent().find('td:first').text();
    let json = {
        method: 'delete',
        data: {
            table: $('#table-dropdown-btn').text(),
            index: row
        }
    };

    $.ajax({
        type: "POST",
        url: '/database', 
        data: JSON.stringify(json),
        success: (data) => { handle_deleted(data); },
        contentType: "application/json",
        dataType: 'json'
    });
});

// Button exit
$('#exit-btn').click(function() {
    $('#show-table').removeClass('table-hover');
    $('#CRUD-btn-group').find('button').prop('disabled', false);
    $('#show-table > tbody').find('tr').off('click mouseenter mouseleave');
    if(STATE == 'insert') {
        $('.table-active').remove();
    }
    else if(STATE == 'edit'){
        let this_row = $('.table-active');
        if(this_row){
            this_row.removeClass('table-active');
            this_row.find('td:last').remove();
            this_row.find('td').each(function() {
                let text = $(this).find('input').val();
                $(this).html(text);
            });
        }
    }
    else if(STATE == 'delete'){
        let this_row = $('.table-active');
        if(this_row){
            this_row.removeClass('table-active');
            this_row.find('td:last').remove();
        }
    }
    STATE = 'init';
    $('#result-alert').attr('class', 'alert alert-info').text('Cancelled');
    $(this).hide();
});


/*** Functions ***/
function handle_result(obj) {
    let method = obj.method;
    let data = obj.data;
    if(method == 'success') {
        try{
            // Header
            let html = '';
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
        }
        catch(err){;}
        $('#result-alert').attr('class', 'alert alert-success').html("Query success!").show();
    }
    else if (method == 'fail') {
        $('#show-table').html('');
        $('#result-alert').attr('class', 'alert alert-danger').html("Query fail!").show();
    }
}

function handle_created(data) {
    if(data.method == 'success') {
        let this_row = $('#create-commit-btn').parent().parent();
        this_row.removeClass('table-active');
        this_row.find('td:last').remove();
        this_row.find('td').each(function() {
            let text = $(this).find('input').val();
            $(this).html(text);
        });
        $('#exit-btn').hide();
        $('#result-alert').attr('class', 'alert alert-success').html("Insert success!");
    }
    else if (data.method == 'fail') {
        $('#result-alert').attr('class', 'alert alert-danger').html("Insert fail!");
    }
}

function handle_updated(data) {
    if(data.method == 'success') {
        let this_row = $('#edit-commit-btn').parent().parent();
        this_row.removeClass('table-active');
        this_row.find('td:last').remove();
        this_row.find('td').each(function() {
            let text = $(this).find('input').val();
            $(this).html(text);
        });
        $('#result-alert').attr('class', 'alert alert-success').html("Update success!");
    }
    else if (data.method == 'fail') {
        $('#result-alert').attr('class', 'alert alert-danger').html("Update fail!");
    }
}

function onRowEditEvent() {
    if($(this).hasClass('table-active') || $(this).parent().is('thead')) return;
    $(this).addClass('table-active');
    let first_col = $(this).find('td:first')
    $(this).find('td').each(function() {
        if($(this).is(first_col)) return true;
        let text = $(this).text();
        $(this).html(`<input type="text" value="${text}" class="form-control form-control-sm">`);
    });
    $(this).append('<td><button class="btn btn-sm btn-danger" type="button" id="edit-commit-btn">ｖ</button></td>');
    let this_row = $(this);
    $('#show-table').find('tr').each(function(event){
        if($(this).is(this_row)) return true;
        $(this).removeClass('table-active');
        $(this).find('td').each(function() {
            let text = $(this).find('input').val();
            $(this).html(text);
        });
        $(this).find('button').parent().remove();
    });
}

function onRowDeleteEvent() {
    if($(this).hasClass('table-active') || $(this).parent().is('thead')) return;
    $(this).addClass('table-active');
    $(this).append('<td><button class="btn btn-sm btn-danger" type="button" id="delete-commit-btn">ｘ</button></td>');
    let this_row = $(this);
    $('#show-table').find('tr').each(function(event){
        if($(this).is(this_row)) return true;
        $(this).removeClass('table-active');
        $(this).find('button').parent().remove();
    });
}

function handle_deleted(data) {
    if(data.method == 'success') {
        $('#delete-commit-btn').parent().parent().remove();
        $('#result-alert').attr('class', 'alert alert-success').html("Delete success!");
    }
    else if (data.method == 'fail') {
        $('#result-alert').attr('class', 'alert alert-danger').html("Delete fail!");
    }
}