function girisYap() {
    var name = $("#name").val();
    var password = $("#password").val();

    if (name != "" && password != "") {
        // Firebase Realtime Database'de kullanıcı adını ve şifreyi kontrol et
        firebase.database().ref("users/").orderByChild("name").equalTo(name).once("value")
            .then((snapshot) => {
                if (snapshot.exists()) {
                    var user = snapshot.val();
                    var userID = Object.keys(user)[0];
                    if (user[userID].password === password) {
                        console.log("Giriş başarılı: " + name);
                        $("#logo").hide();
                        $("#girisEkrani").hide();
                        $("#chatEkrani").show();
                        chatYukle();
                        // Oturumu başlat ve kullanıcıyı yönlendirme gibi işlemler burada yapılmalıdır.
                    } else {
                        alert("Şifre yanlış.");
                    }
                } else {
                    alert("Kullanıcı bulunamadı.");
                }
            })
            .catch((error) => {
                console.error("Giriş sırasında hata oluştu: " + error);
                alert("Giriş yapılırken bir hata oluştu.");
            });
    } else {
        alert("Kullanıcı adı ve şifre boş bırakılamaz!");
    }
}




// Giriş yapma işlemi
$("#girisYapBtn").click(function() {
    girisYap();
});

$(document).ready(function () {
    chatYukle();
});

function mesajGonder() {
    var mesaj = $("#mesaj").val();
    var kadi = $("#name").val(); // Kullanıcı adını aldığınızdan emin olun

    if (kadi != "" && mesaj != "") {
        var date = new Date();
        var messageKey = firebase.database().ref("chats/").push().key;
        var mesajVerisi = {
            message: mesaj,
            from: kadi,
            date: date.getTime()
        };
        firebase.database().ref("chats/" + messageKey).set(mesajVerisi)
            .then(function() {
                // Mesaj başarıyla gönderildiğinde yapılması gereken işlemleri ekleyebilirsiniz
                $("#mesaj").val('');
            })

            
            .catch(function(error) {
                console.error("Mesaj gönderme hatası: " + error);
                alert("Mesaj gönderilirken bir hata oluştu.");
            });
    } else {
        alert("Lütfen boş alan bırakmayınız!");
    }
}

function scrollToBottom() {
    var mesajAlani = document.getElementById("mesajAlani");
    mesajAlani.scrollTop = mesajAlani.scrollHeight;
}




function chatYukle() {
    var query = firebase.database().ref("chats");
    var name = $("#name").val();
    query.on('value', function (snapshot) {
        $("#mesajAlani").html("");
        snapshot.forEach(function (childSnapshot) {
            var data = childSnapshot.val();
            var date = new Date(data.date);
            var saatDakika = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

            if (data.from == name) {
                var mesaj = `<div class="d-flex justify-content-end">
                <div class="alert alert-info" role="alert">
                <b>@`+ data.from + `</b> ` + data.message +`</b><br> ` + saatDakika + `
                </div>
                 </div>`;
                $("#mesajAlani").append(mesaj);
            } else {
                var mesaj = `<div class="d-flex">
                                    <div class="alert alert-dark" role="alert">
                                      <b>@`+ data.from + `</b> ` + data.message + `<br> ` + saatDakika + `
                                  </div>
                           </div>`;
                $("#mesajAlani").append(mesaj);
            }
        });

        var mesajAlani = document.getElementById("mesajAlani");
        mesajAlani.scrollTop = mesajAlani.scrollHeight;
    });
}
function dosyaYukle() {
    var dosyaInput = document.getElementById("dosyaYukleInput");
    var dosya = dosyaInput.files[0];
    var storageRef = firebase.storage().ref();

    if (dosya) {
        // Dosya uzantısını alın
        var dosyaUzantisi = dosya.name.split(".").pop().toLowerCase();

        // İzin verilen dosya uzantıları listesi (örneğin, resim uzantıları)
        var izinVerilenUzantilar = ["jpg", "jpeg", "png", "gif"];

        // Dosya uzantısını kontrol edin
        if (izinVerilenUzantilar.indexOf(dosyaUzantisi) === -1) {
            alert("Geçersiz dosya uzantısı. Lütfen sadece resim dosyaları yükleyin.");
            return;
        }

        // İzin verilen dosya türlerini yükleme işlemine devam edin
        var dosyaYolu = "dosyalar/" + dosya.name;

        var uploadTask = storageRef.child(dosyaYolu).put(dosya);

        uploadTask.on('state_changed', function (snapshot) {
            // Dosya yükleme durumu değiştikçe yapılacak işlemler burada olabilir
        }, function (error) {
            console.error("Dosya yükleme hatası: " + error);
            alert("Dosya yüklenirken bir hata oluştu.");
        }, function () {
            // Dosya yükleme tamamlandığında yapılacak işlemler
            alert("Dosya başarıyla yüklendi.");

            // Dosyanın URL'sini alın
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                // Dosyayı görüntülemek veya indirmek için kullanabileceğiniz bağlantıyı gösterin
                $("#mesaj").val(`<img src="${downloadURL}" alt="Resim" style="max-width: 180px;" /> <a href="${downloadURL}" target="_blank" download="${dosya.name}">Dosyayı İndir</a>`);
            });
        });
    } else {
        alert("Dosya seçilmedi.");
    }
}




// Giriş yapma işlemi
$("#girisYapBtn").click(function() {
    var beniHatirla = $("#beniHatirla").prop("checked"); // "Beni Hatırla" seçeneğini kontrol et

    // Kullanıcı adı ve şifre kontrolü gibi işlemler

    if (girisBasarili) {
        if (beniHatirla) {
            // Kullanıcı "Beni Hatırla"yı işaretlediyse çerez oluşturun
            var now = new Date();
            now.setTime(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 gün boyunca geçerli
            document.cookie = "kullaniciAdi=" + kullaniciAdi + "; expires=" + now.toUTCString() + "; path=/";
        }

        // Oturumu başlat ve kullanıcıyı yönlendirme gibi işlemler
    }
});
// Sayfa yüklendiğinde oturumu kontrol et
$(document).ready(function () {
    var kullaniciAdi = getCookie("kullaniciAdi");
    if (kullaniciAdi) {
        // Kullanıcı adı çerezde bulunuyorsa oturumu başlat ve giriş yap
        $("#name").val(kullaniciAdi);
        // Diğer giriş işlemleri
    }
});

// Verilen çerez adını kullanarak çerezi alın
function getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

