(function(){
  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  // mobile menu
  var btn=document.querySelector('.menu-btn'), menu=document.getElementById('menu');
  if(btn&&menu){
    btn.addEventListener('click',function(){
      var open=menu.classList.toggle('open');
      btn.setAttribute('aria-expanded',open);
      btn.setAttribute('aria-label',open?'Close menu':'Open menu');
    });
    menu.addEventListener('click',function(e){ if(e.target.tagName==='A') menu.classList.remove('open'); });
  }
  // portfolio filter
  var fb=document.querySelectorAll('.filters button'), works=document.querySelectorAll('#works .work');
  fb.forEach(function(b){
    b.addEventListener('click',function(){
      fb.forEach(function(x){x.classList.remove('active')}); b.classList.add('active');
      var f=b.getAttribute('data-filter');
      works.forEach(function(w){ w.classList.toggle('hide', f!=='all' && w.getAttribute('data-cat')!==f); });
    });
  });
  // contact form -> opens email app
  var form=document.getElementById('contact-form');
  if(form){
    var msg=document.getElementById('form-msg');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var n=form.name, em=form.email, m=form.message, ok=true;
      [n,em,m].forEach(function(f){f.classList.remove('err')});
      if(!n.value.trim()){n.classList.add('err');ok=false}
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())){em.classList.add('err');ok=false}
      if(!m.value.trim()){m.classList.add('err');ok=false}
      if(!ok){msg.className='form-msg bad';msg.textContent='Please fill in your name, a valid email and your message.';return}
      var to=document.querySelector('footer a[href^="mailto:"]').getAttribute('href').replace('mailto:','');
      var subject='Project enquiry: '+form.service.value;
      var body='Name: '+n.value.trim()+'\nEmail: '+em.value.trim()+'\nService: '+form.service.value+'\n\n'+m.value.trim();
      msg.className='form-msg ok';msg.textContent='Opening your email app...';
      window.location.href='mailto:'+to+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    });
  }
})();
