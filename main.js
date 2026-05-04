var img_load = function() {
	if ($('#dialog').length) $('#dialog').dialog('option', 'position', 'center');
};

var log = function(txt) {
	if (typeof console != 'undefined') {
		console.log(txt);
	}
}

window.get_ip = function(data, nr) {
	if (nr==null) {
		var max1 = 0, n = 0;
		var t = '<label for="nr">Podaj nr stanowiska laboratoryjnego: </label>';
		t += '<select name="select_nr" id="select_nr">';
		t += '<option value="">-</option>';
		for (var k in conf) {
			max1 = conf[k].length;
			break;
		}
		for (n=0; n<max1; n++) {
			t += '<option value="' + (n+1) + '">s' + (n+1) + '</option>';
		}
		t += '</select>';
		$('#div_values').html(t);
		$('#select_nr').on('change', function(e) {
			var nr = parseInt($('#select_nr').val());
			window.get_ip(null, nr);
		});
	} else {
		window.nr = nr;
		var t1 = '<thead><tr>';
		var t2 = '<tr>';
		var body_html = $('body').html();
		
		for (var k in conf) {
			t1 += '<td>' + k.replace(/<nr>/, nr).replace(/_/, ': ') + '</td>';
			t2 += '<td>' + conf[k][nr-1] + '</td>';
			body_html = body_html.replace('[' + k + ']', '[' + k + '] <i>(' + conf[k][nr-1] + ')</i>');
			body_html = body_html.replace(new RegExp('{' + k + '}', 'gi'), conf[k][nr-1]);
		}
		
		$('body').html(body_html);
		t1 += '</tr></thead>';
		t2 += '</tr>';
		$('#div_values').html('<table>' + t1 + t2 + '</table>');
		init();
	}
}

function init() {
	$('a').on('click', function(e) {
		var href = $(this).attr('href');
		var txt = ($(this).attr('data-title')) ? $(this).attr('data-title') : $(this).text();
		if (href.substring(0,4)!='img/') return;
		e.preventDefault();
		if ($('#dialog').length) $('#dialog').remove();
		var o_dialog = $('<div id="dialog"></div>').appendTo('body');
		o_dialog.dialog({ autoOpen: true, title: txt, modal: true, hide: 'fade', width: 'auto', position: 'center',
			open: function(event) {
				$(this).html('<img src="' + href + '" onload="img_load();" />');
			},
		});
	});
	$('button,input[type=button]').button();
	$('input.ip').attr('placeholder', '---.---.---.---');

	var n_img = 0;	
	$('div.img_text').each(function() {
		var t = $(this).html();
		if (t.match(/Rys. n/i)) {
			t = t.replace(/Rys. n/i, 'Rys. ' + (n_img + 1));
			$(this).html(t);
			$(this).prev().attr('alt', t).attr('title', t);
			n_img++;			
		}
	});
	
	$('div.accordion > div').accordion({
		collapsible: true,
		active: false,
		heightStyle: "content"
	});
	
	$('pre').each(function() {
		$(this).html($(this).html().replace(/\t+/g, ''));
	});
}



function init_toc() {
	var t1 = '';
	var txt = '<ol id="toc">';
	var n = 1;
	var toc_enabled = (($('#toc_fieldset').length != 0) && ($('#toc_div').length != 0)) ? true : false;
	
	$('h2').each(function() {
		t1 = $(this).html();
		$(this).attr('id', 'h2_' + n);
		txt += '<li><a href="#h2_' + n + '">' + t1 + '</a></li>';
		if (toc_enabled) {
			$(this).html('<a class="up">&#9650;</a>' + t1);
		}
		n++;
	});
	txt += '</ol>';
	if (toc_enabled) {
		$('#toc_div').html(txt);
	}
	
	$('#toc li a').on('click', function(e) {
		$('html,body').animate({scrollTop: $($(this).attr('href')).offset().top}, 'slow');
	});
	
	$('a.up').attr('href', '#').attr('title', 'Powrót do góry').tooltip().on('click', function(e) {
		$('html,body').animate({scrollTop: 0}, 'slow');
	});
	
	$('h1').each(function(i, el) {
		if (i == 0) $('title').html($(this).html());
	});
}



$(document).ready(function() {
	if ((typeof check_ip_callback != 'undefined') && (check_ip_callback)) {
		/*$.getJSON('http://server.s308/getip.php?callback=?', function(data) {
		}).error(function(err) {
		});*/

		$.ajax({
			url: 'http://server.s308/z/misc/getip.php?callback=?',
			dataType: 'json',
			timeout: 5000,
			success: function(data) {
				var A = data.ip.match(/^192\.168\.1\.([0-9]{1,3})$/i);
				
				if ((A) && (parseInt(A[1])>100) && (parseInt(A[1])<=114)) {
					var nr = parseInt(A[1]) - 100;
					log('nr: ' + nr);
					window[check_ip_callback](data, nr);
				} else {
					log('incorrect ip: ' + data.ip);
					window[check_ip_callback](null, null);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if (textStatus=='timeout') {
					window[check_ip_callback](null, null);
				} else {
					log('error: ' + textStatus);
				}
			}
		});
	}
	init();
	init_toc();

        $('code').each(function() {
                $(this).text($(this).text().replace(/^\n+/, ''));
        });
});
