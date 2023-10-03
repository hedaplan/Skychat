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
                        // Giriş başarılı olduğunda son giriş tarihini ve saati kaydet
                        var tarihSaat = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
                        firebase.database().ref("users/" + userID + "/lastLogin").set(tarihSaat);

                        // Kullanıcının e-posta adresini alın
                        var userEmail = user[userID].email;


                        console.log("Giriş başarılı: " + name);
                        $("#logo").hide();
                        $("#girisEkrani").hide();
                        $("#chatEkrani").show();
                        chatYukle();
                        scrollToBottom();

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





function mesajGonder() {
    var mesaj = $("#mesaj").val();
    var kadi = $("#name").val(); // Kullanıcı adını aldığınızdan emin olun
    var tarihSaat = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });


    if (kadi != "" && mesaj != "") {
        var date = new Date();
        var messageKey = firebase.database().ref("chats/").push().key;
        var mesajVerisi = {
            message: mesaj,
            from: kadi,
            date: tarihSaat
        };
        firebase.database().ref("chats/" + messageKey).set(mesajVerisi)
            .then(function() {
                // Mesaj başarıyla gönderildiğinde yapılması gereken işlemleri ekleyebilirsiniz
                $("#mesaj").val('');
                scrollToBottom();

            })      
            .catch(function(error) {
                console.error("Mesaj gönderme hatası: " + error);
                alert("Mesaj gönderilirken bir hata oluştu.");
            });
    } else {
        alert("Lütfen boş alan bırakmayınız!");
    }
}


// Mesajları yüklerken tarih ve saat metinlerinin boyutunu ayarla
function chatYukle() {
    var query = firebase.database().ref("chats");
    var name = $("#name").val();
    query.on('value', function (snapshot) {
        $("#mesajAlani").html("");
        snapshot.forEach(function (childSnapshot) {
            var data = childSnapshot.val();
            var tarihSaat = data.date; // Mesajın tarih ve saat bilgisini al

            if (data.from == name) {
                var mesaj = `<div class="d-flex justify-content-end">
                <div class="alert alert-info" role="alert">
                <b>@`+ data.from + `</b> ` + data.message +`</b><br> <span class="mesaj-tarih-saat">` + tarihSaat + `</span>
                </div>
                 </div>`;
                $("#mesajAlani").append(mesaj);
            } else {
                var mesaj = `<div class="d-flex">
                                    <div class="alert alert-dark" role="alert">
                                      <b>@`+ data.from + `</b> ` + data.message + `<br> <span class="mesaj-tarih-saat">` + tarihSaat + `</span>
                                  </div>
                           </div>`;
                $("#mesajAlani").append(mesaj);
            }
        });
    });
}


$(document).ready(function () {
    chatYukle();
});


// Dosya seçildiğinde tetiklenecek işlev


function dosyaYukle() {
    var dosyaInput = document.getElementById("dosyaInput");
    var dosya = dosyaInput.files[0];

    // Dosya seçilmediyse işlemi sonlandır
    if (!dosya) {
        return;
    }


    document.getElementById("dosyaInput").addEventListener("change", function (event) {
        var dosyaInput = document.getElementById("dosyaInput");
        var dosya = dosyaInput.files[0];
    
        // Dosya seçilmediyse işlemi sonlandır
        if (!dosya) {
            alert("Dosya seçilmedi.");
            return;
        }
                // Önceki dosyayı temizle
                document.getElementById("dosyaInput").value = "";
    
                dosyaYukle(dosya); // Yeni dosyayı yükleme işlemini başlat
            });

    var storageRef = firebase.storage().ref();

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

    // Yükleme durumu değiştikçe süreyi güncelle
    uploadTask.on('state_changed', function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Yükleme progress: ' + progress + '%');
        // İlerleme durumunu kullanarak bir süre gösterebilirsiniz
        document.getElementById('yuklemeSuresi').innerText = 'Yükleniyor: ' + progress.toFixed(2) + '%';
    }, function (error) {
        console.error("Dosya yükleme hatası: " + error);
        alert("Dosya yüklenirken bir hata oluştu.");
    }, function () {
        // Dosya yükleme tamamlandığında yapılacak işlemler
        setTimeout(function () {
            // Dosya yükleme tamamlandıktan 2 saniye sonra yükleme süresi alanını gizler
            document.getElementById('yuklemeSuresi').style.display = 'none';
        }, 2000); // 2 saniye

        // Dosyanın URL'sini alın
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            // Tarih ve saat bilgisini alın (dd.MM.yyyy HH:mm formatında)
            var tarihSaat = new Date().toLocaleString('tr-TR', {
                timeZone: 'Europe/Istanbul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Dosyayı görüntülemek veya indirmek için kullanabileceğiniz bağlantıyı chat penceresine ekleyin
            var mesaj = `<img src="${downloadURL}" alt="Resim" style="max-width: 100%;" />`;
            mesaj; // Tarih ve saati ekleyin

            // Mesajı chat penceresine ekleyin
            firebase.database().ref("chats/").push().set({
                message: mesaj,
                from: $("#name").val(),
                date: tarihSaat
            }).then(function () {
                // Başka işlemler yapabilirsiniz
            }).catch(function (error) {
                console.error("Mesaj gönderme hatası: " + error);
                alert("Mesaj gönderilirken bir hata oluştu.");
            });
        });
    });
}


// Mesaj yazma alanını seçin
var mesajInput = document.getElementById('mesaj');




// Enter tuşuna basıldığında mesaj gönderme işlemini yap
mesajInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) { // Enter'a basıldı ve Shift tuşuna basılmadı
        event.preventDefault(); // Sayfa yenilenmesini önle
        mesajGonder(); // Mesajı gönder
    }
});



// Mesaj başarıyla gönderildiğinde yapılması gereken işlemler
$("#mesaj").val('');
// Mesaj alanına odaklan
document.getElementById('mesaj').focus();


function scrollToBottom() {
    var mesajAlani = document.getElementById('mesajAlani');
    mesajAlani.scrollTop = mesajAlani.scrollHeight;
  }

  var query = firebase.database().ref("chats");
query.on('value', function (snapshot) {
  // Mesajlar görüntülendikten sonra en alta kaydır
  scrollToBottom();
});

// Sayfa yüklendiğinde en alta kaydır
$(document).ready(function () {
  scrollToBottom();
});




  