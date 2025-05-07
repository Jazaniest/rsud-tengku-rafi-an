(function ($) {
    "use strict";

    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        return check;
    });

    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }

    /*==================================================================
    [ Tambahan: Cek status switch dan tampilkan konten dummy ]
    */
    // async function checkSwitchAndDisplay() {
    //     try {
    //         const response = await fetch('/api/switch/status');
    //         if (!response.ok) throw new Error('Gagal mengambil status switch');

    //         const data = await response.json();
    //         console.log('Status switch untuk tampilkan konten:', data.status);

    //         var targetElement = document.getElementById('registerButton'); // Pastikan ada elemen ini di HTML

    //         if (!targetElement) {
    //             console.error('Element registerButton tidak ditemukan.');
    //             return;
    //         }

    //         if (data.status === true) {
    //             targetElement.innerHTML = `
    //                 <p style="font-style: italic;">Belum memiliki akun?</p>
    //             	<a class="txt2" href="register.html">
	// 					Buat akun anda
	// 					<i class="fa fa-long-arrow-right m-l-5" aria-hidden="true"></i>
	// 				</a>
    //             `;
    //         } else {
    //             targetElement.innerHTML = "";
    //             targetElement.style.display = "none";
    //         }

    //     } catch (error) {
    //         console.error('Error saat mengambil status switch:', error);
    //     }
    // }

    // Panggil fungsi ini setelah halaman siap
    // document.addEventListener('DOMContentLoaded', function () {
    //     checkSwitchAndDisplay();
    // });

})(jQuery);
