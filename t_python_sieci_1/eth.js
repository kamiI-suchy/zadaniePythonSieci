$(document).ready(function() {
	$('input').each(function(ind, el) {
		var len = ($(this).data('len')) ? $(this).data('len') : 0;
		var name = $(this).attr('name');
		if (len>0) {
			$(this).css({ width: (len * 2) + 'em' });
			$(this).attr('maxlength', len * 3 - 1);
			//$(this).attr('required', '');
			//$(this).attr('pattern', '[a-fA-F0-9 :-]{' + (len * 2) + ',' + (len * 3 - 1) + '}');
		}
		if ((name=='ipv4_id') || (name=='udp_src_port') || (name=='data_number')) {
			set_random(name);
		}
	});
	
	$('input[name^=data_fill]').each(function(ind, el) {
		var n = 0;
		var t = '';
		for (n=0; n<$(this).data('len'); n++) {
			if (n>0) t += ' ';
			t += '00';
		}
		$(this).val(t);
		//$(this).prop('disabled', true);
	});
	
	$('input[name=ipv4_v_ihl],input[name=ipv4_tos]').prop('disabled', true);
	
	$('form[name=f1]').submit(function(e) {
		e.preventDefault();
		save_local_storage();
		var host = $('#s_host').val();
		if (host=='') {
			alert('Wybierz nr stanowiska');
			return;
		} else if (check()) {
			var data_hex = get_data();
			var fcs = hex_conv($('input[name=eth_fcs]').val());
			$.ajax({
				url: 'misc/send_pkt.php', type: 'post', cache: false, dataType: 'json',
				data: { ajax: 1, data_hex: data_hex, fcs: fcs, host: host },
				success: function(data, sTextStatus, oXMLHttpRequest) {
					var t = 'IPv4 id: ' + hex_conv($('input[name=ipv4_id]').val()) + '\n';
					t += 'UDP source port: ' + hex_conv($('input[name=udp_src_port]').val()) + '\n';
					t += 'Random number: ' + hex_conv($('input[name=data_number]').val()) + '\n';
					if (data.result=='ok') {
						alert('Pakiet wysłany do ' + $('#s_host').val() + '\n\n' + t);
					} else {
						alert('Error: ' + data.result + '\n\n' + t);
					}
					set_random('ipv4_id');
					set_random('udp_src_port');
					set_random('data_number');
					$('td.hex_data span').html('&nbsp;');
					$('#txt_calc').val('');
				},
				error: function(oXMLHttpRequest, sTextStatus, oErrorThrown) { alert(oErrorThrown); }
			});
		}
	});
	
	
	$('#btn_update').on('click', function(e) {
		if (check()) get_data();
	});

	$('#btn_calc_clear').on('click', function(e) {
		$('#txt_calc').val('').focus();
	});

	
	$('#btn_calc_crc32').on('click', function(e) {
		var t = hex_conv($('#txt_calc').val());
		$('#result_calc').val(hex_conv(conv_le_hex(crc32(t)), ' '));
	});
	
	$('#btn_calc_sum').on('click', function(e) {
		var t = hex_conv($('#txt_calc').val());
		var sum = hex_sum(t);
		$('#result_calc').val(sum + '   (0x' + sum.toString(16) + ')');
	});
});



function set_random(name) {
	var min_value = 0, max_value = 0;
	if (name=='data_number') {
		min_value = 0x10000000;
		max_value = 0xffffffff;
	} else {
		min_value = 0x1000;
		max_value = 0xffff;
	}
	var r = min_value + Math.round(Math.random() * (max_value - min_value));
	$('input[name=' + name + ']').val(hex_conv(r.toString(16), ' ')).prop('disabled', true);
}



function check() {
	var t = '';
	var err_count = 0;
	var err_txt = '';
	var regexp = new RegExp('^[a-fA-F0-9 :-]+$', 'i');
	var obj_focus = null;
	$('input[type=text]').each(function(ind, el) {
		if (!$(this).data('len')) return;
		var len = $(this).data('len');
		var name = $(this).attr('name');
		var val = $(this).val();
		err_txt = '';
		
		if (val=='') {
			err_txt = 'empty field'
			err_count++;
		} else if (!val.match(regexp)) {
			err_txt = 'incorrect hex characters'
			err_count++;
		} else {
			t = val.replace(/[ :-]/gi, '');
			if (t.length%2) {
				err_txt = 'incorrect hex values';
				err_count++;
			} else if (t.length!=(2*len)) {
				err_txt = 'incorrect number of bytes (' + len + ')';
				err_count++;
			}
		}
		
		if (err_txt!='') {
			$(this).css({ border: 'solid 1px red' });
			$(this).attr('title', err_txt);
			if (obj_focus==null) obj_focus = $(this);
		} else {
			$(this).css({ border: 'solid 1px #888' });
			$(this).attr('title', '');
		}
	});
	
	if (err_count>0) {
		obj_focus.focus();
		alert('Liczba pól do poprawki: ' + err_count);
		return false;
	} else {
		return true;
	}
}



function crc32(hex_str) {
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    var crc = 0;
    var x = 0;
    var y = 0;
	var v = 0;

    crc = crc ^ (-1);
    for( var i = 0, iTop = hex_str.length/2; i < iTop; i++ ) {
        //y = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
		//v = str.charCodeAt( i );
		v = parseInt(hex_str.substring(i*2, (i+1)*2), 16);
		y = ( crc ^ v ) & 0xFF;
        x = "0x" + table.substr( y * 9, 8 );
        crc = ( crc >>> 8 ) ^ x;
    }

    return (crc ^ (-1)) >>> 0;
};



function conv_le_hex(v) {
	var t1 = v.toString(16);
	var t2 = t1.substring(6, 8) + t1.substring(4, 6) + t1.substring(2, 4) + t1.substring(0, 2);
	return t2;
}



function hex_conv(txt, ch) {
	if ((!txt) || (txt=='')) return '';
	var ch = (ch) ? ch : '';
	var t1 = txt.toLowerCase().replace(/[\s:-]+/g, '')
	var len = t1.length / 2;
	var n = 0;
	var t = '';
	for (n=0; n<len; n++) {
		if ((n>0) && (n%2==0)) t += ch;
		t += t1.substring(2 * n, 2 * (n + 1));
	}
	return t;
}



function hex_sum(txt) {
	var len = Math.ceil(txt.length / 4);
	var n = 0;
	v = 0;
	for (n=0; n<len; n++) {
		v += parseInt(txt.substring(4 * n, 4 * (n + 1)), 16);
	}
	return v;
}



function get_data() {
	var hex_eth = $('input[name=eth_dst_mac]').val() + $('input[name=eth_src_mac]').val() + $('input[name=eth_type]').val();
	$('#s_eth').html(hex_conv(hex_eth, ' '));
	var hex_ipv4 = $('input[name=ipv4_v_ihl]').val() + $('input[name=ipv4_tos]').val() + $('input[name=ipv4_len]').val() + $('input[name=ipv4_id]').val() + $('input[name=ipv4_flags_offset]').val() + $('input[name=ipv4_ttl]').val() + $('input[name=ipv4_protocol]').val() + $('input[name=ipv4_checksum]').val() + $('input[name=ipv4_src_ip]').val() + $('input[name=ipv4_dst_ip]').val();
	$('#s_ipv4').html(hex_conv(hex_ipv4, ' '));
	var hex_udp = $('input[name=udp_src_port]').val() + $('input[name=udp_dst_port]').val() + $('input[name=udp_len]').val() + $('input[name=udp_checksum]').val();
	$('#s_udp').html(hex_conv(hex_udp, ' '));
	var hex_data = $('input[name=data_number]').val() + $('input[name=data_fill_1]').val() + $('input[name=data_fill_2]').val();
	$('#s_data').html(hex_conv(hex_data, ' '));
	var t = hex_conv(hex_eth + hex_ipv4 + hex_udp + hex_data);
	return t;
}



function save_local_storage() {
	const form = document.getElementById("f1");

	// Save on input
	form.addEventListener("input", () => {
	  const data = {};

	  // Collect all form values
	  Array.from(form.elements).forEach(el => {
	    if (el.name) {
	      data[el.name] = el.value;
	    }
	  });

	  // Store as JSON
	  localStorage.setItem("linux_eth", JSON.stringify(data));
	  //console.log(data);
	});
}


function restore_local_storage() {
	window.addEventListener("DOMContentLoaded", () => {
	  const savedData = localStorage.getItem("f1");

	  if (savedData) {
	    const data = JSON.parse(savedData);
	    const form = document.getElementById("f1");

	    Array.from(form.elements).forEach(el => {
	      if (el.name && data[el.name] !== undefined) {
	        el.value = data[el.name];
	      }
	    });
	  }
	});
}
