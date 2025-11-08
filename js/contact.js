// 聯絡主辦
(function () {
  function init(data){
    const info = data?.contact || {};
    const email = info.email || data?.info?.email || '';
    const phone = info.phone || '';
    const addr  = info.address || '';
    const mapUrl= info.mapUrl || '';

    const emailA = document.getElementById('cEmailCard');
    const phoneA = document.getElementById('cPhoneCard');
    const addrA  = document.getElementById('cAddrCard');
    const emailTxt = document.getElementById('cEmailTxt');
    const phoneTxt = document.getElementById('cPhoneTxt');
    const addrTxt  = document.getElementById('cAddrTxt');

    if (emailA){ emailA.href = email ? `mailto:${email}` : '#'; }
    if (phoneA){ phoneA.href = phone ? `tel:${phone}` : '#'; }
    if (addrA){
      addrA.href = mapUrl || (addr ? `https://maps.google.com/?q=${encodeURIComponent(addr)}` : '#');
      addrA.target = '_blank'; addrA.rel = 'noopener';
    }
    if (emailTxt) emailTxt.textContent = email || '—';
    if (phoneTxt) phoneTxt.textContent = phone || '—';
    if (addrTxt)  addrTxt.textContent  = addr  || '—';

    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('cfSubmit');
    const statusEl = document.getElementById('cfStatus');
    if (!form) return;

    const setErr = (id, has)=>{
      const wrap = document.getElementById(id)?.closest('.field');
      if (!wrap) return;
      has ? wrap.classList.add('invalid') : wrap.classList.remove('invalid');
    };

    function validate(){
      const name = document.getElementById('cfName')?.value.trim();
      const email = document.getElementById('cfEmail')?.value.trim();
      const subject = document.getElementById('cfSubject')?.value.trim();
      const message = document.getElementById('cfMessage')?.value.trim();
      const emailOK = !!(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      setErr('cfName', !name); setErr('cfEmail', !emailOK);
      setErr('cfSubject', !subject); setErr('cfMessage', !message);
      return !!(name && emailOK && subject && message);
    }

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      if (!validate()){
        statusEl.className = 'cf-status fail';
        statusEl.textContent = '請完整填寫必填欄位。';
        return;
      }

      const payload = {
        name: document.getElementById('cfName').value.trim(),
        email: document.getElementById('cfEmail').value.trim(),
        company: document.getElementById('cfCompany').value.trim(),
        subject: document.getElementById('cfSubject').value.trim(),
        message: document.getElementById('cfMessage').value.trim(),
        expo: data?.hero?.title || 'Expo'
      };

      submitBtn.disabled = true;
      submitBtn.textContent = '送出中…';
      statusEl.className = 'cf-status'; statusEl.textContent = '';

      try{
        if (info.endpoint){
          const res = await fetch(info.endpoint, {
            method:'POST', headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('server');
          statusEl.className = 'cf-status ok';
          statusEl.textContent = '已送出，我們會盡快回覆您！';
          form.reset();
        }else{
          const to = email || '';
          const subject = `[${payload.expo}] ${payload.subject}`;
          const body = `姓名：${payload.name}%0AEmail：${payload.email}%0A公司：${payload.company}%0A----%0A${encodeURIComponent(payload.message)}`;
          window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${body}`;
          statusEl.className = 'cf-status ok';
          statusEl.textContent = '已開啟郵件軟體，您也可直接寄信給主辦。';
        }
      }catch(err){
        statusEl.className = 'cf-status fail';
        statusEl.textContent = '送出失敗，請稍後再試或直接使用 Email 聯絡主辦。';
      }finally{
        submitBtn.disabled = false;
        submitBtn.textContent = '送出';
      }
    });

    form.addEventListener('reset', ()=>{
      statusEl.className = 'cf-status';
      statusEl.textContent = '';
      form.querySelectorAll('.field.invalid').forEach(el=> el.classList.remove('invalid'));
    });
  }

  window.Contact = { init };
})();