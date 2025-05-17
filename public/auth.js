/* ============================
   Combined main + auth JS
   Filename: app.js
   ============================ */
(function ($) {
    "use strict";

    // Focus input handling
    $('.input100').each(function(){
        $(this).on('blur', function(){
            var val = $(this).val() || '';
            $(this).toggleClass('has-val', val.trim() !== '');
        });
    });

    // Form validation (generic for login & register)
    var inputs = $('.validate-form .input100');
    $('.validate-form').on('submit', function(){
        var valid = true;
        inputs.each(function(){
            if (!validateField(this)) {
                showValidate(this);
                valid = false;
            }
        });
        return valid;
    });
    $('.validate-form .input100').focus(function(){ hideValidate(this); });

    function validateField(input) {
        var $i = $(input);
        var val = $i.val() || '';
        if ($i.attr('type') === 'email' || $i.attr('name') === 'email') {
            var emailRegex = /^([a-zA-Z0-9_\-\.]+)@(([a-zA-Z0-9\-]+\.)+)([a-zA-Z]{1,5}|[0-9]{1,3})$/;
            return emailRegex.test(val.trim());
        }
        return val.trim() !== '';
    }
    function showValidate(input) { $(input).parent().addClass('alert-validate'); }
    function hideValidate(input) { $(input).parent().removeClass('alert-validate'); }

    // Toggle register link based on switch status
    async function checkSwitchAndDisplay() {
        try {
            const res = await fetch('/api/switch/status');
            if (!res.ok) throw new Error();
            const { status } = await res.json();
            var el = document.getElementById('registerButton');
            if (!el) return;
            if (status) {
                el.style.display = '';
                el.innerHTML = `
                    <p style="font-style: italic;">Belum memiliki akun?</p>
                    <a class="txt2" href="register.html">
                        Buat akun anda
                        <i class="fa fa-long-arrow-right m-l-5" aria-hidden="true"></i>
                    </a>
                `;
            } else {
                el.style.display = 'none';
            }
        } catch (e) {
            console.error('Gagal ambil status switch', e);
        }
    }

    document.addEventListener('DOMContentLoaded', function(){
        checkSwitchAndDisplay();

        if (document.getElementById('loginForm')) initAuth();
        if (document.getElementById('registerForm')) initRegister();
    });

    // Authentication (login)
    function initAuth() {
        $('#loginForm').on('submit', async function(e) {
            e.preventDefault();
            var username = $('#username').val() || '';
            var password = $('#password').val() || '';
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '../dashboard/index.html';
                } else {
                    alert('Login gagal: periksa kredensial.');
                }
            } catch (err) { console.error(err); alert('Kesalahan saat login.'); }
        });
    }

    // Registration initialization
    function initRegister() {
        var form = document.getElementById('registerForm');
        var wrapper = document.getElementById('roleFieldWrapper');
        // hidden role default
        var hiddenRole = $('<input>',{type:'hidden',name:'role',id:'hiddenRoleInput',value:'staff'}).appendTo(form);

        // Fetch profile to adjust role field for super admin
        (async ()=>{
            try {
                var token = localStorage.getItem('token');
                if (!token) throw 0;
                var pr = await fetch('/api/auth/profile',{ headers:{'Authorization':'Bearer '+token} });
                if (!pr.ok) throw new Error();
                var profile = await pr.json();
                if (profile.role === 'super admin') {
                    wrapper.style.display = 'block';
                    hiddenRole.remove();
                }
            } catch {};
        })();

        // Password match indicator
        var pw = $('#password'), cpw = $('#confirmPassword'), msg = $('#passwordMatchMessage');
        function checkMatch(){
            var v1 = pw.val() || '', v2 = cpw.val() || '';
            if (!v2) msg.text('');
            else if (v1 === v2) msg.text('Password sesuai ✔️').removeClass('text-danger').addClass('text-success');
            else msg.text('Password tidak sesuai ❌').removeClass('text-success').addClass('text-danger');
        }
        pw.add(cpw).on('keyup', checkMatch);

        // Submit handler
        $('#registerForm').on('submit', function(e){
            e.preventDefault();
            var hasDropdown = $('#inputRole').is(':visible');
            var roleVal = hasDropdown ? ($('#inputRole').val() || '') : $('#hiddenRoleInput').val();
            if (hasDropdown && !roleVal) { alert('Pilih role terlebih dahulu.'); return; }
            var payload = {
                username: $('#username').val() || '',
                password: pw.val() || '',
                namaLengkap: $('#namaLengkap').val() || '',
                role: roleVal
            };
            $.ajax({
                url:'/api/auth/register', method:'POST', contentType:'application/json',
                data: JSON.stringify(payload),
                success: function(){ alert('Registrasi berhasil'); window.location.href = 'index.html'; },
                error: function(xhr){
                    var m = xhr.responseJSON?.message || 'Gagal registrasi';
                    alert('Registrasi gagal: '+m);
                }
            });
        });
    }

})(jQuery);