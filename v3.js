/* colour tiles */
(function(){
document.addEventListener('click',function(e){
  var c=e.target.closest('.chip');
  if(c){e.preventDefault();var w=c.closest('.cardwrap'),im=w.querySelector('.card img'),a=w.querySelector('.card');im.src=c.dataset.src;
    w.querySelectorAll('.chip').forEach(function(x){x.classList.toggle('on',x===c)});a.href=a.href.split('#')[0]+'#c'+c.dataset.n;return}
  var s=e.target.closest('.sw');if(s)pick(+s.dataset.n,true);
});
function pick(n,scroll){
  var sel=document.getElementById('pick'),all=document.querySelectorAll('.sw');if(!all[n])return;
  if(sel){sel.selectedIndex=n;sel.dispatchEvent(new Event('change'));}all.forEach(function(x,i){x.classList.toggle('on',i===n)});
  var nm=document.getElementById('swname');if(nm)nm.textContent=all[n].dataset.name||(sel?sel.options[n].text:'');
  var ph=document.getElementById(all[n].dataset.ph),main=ph&&ph.parentNode;if(main&&scroll!==null)main.scrollTo({left:ph.offsetLeft-main.offsetLeft,behavior:scroll?'smooth':'auto'});
}
var m=/^#c(\d+)$/.exec(location.hash);if(m)window.addEventListener('load',function(){pick(+m[1],false)});
var ps=document.getElementById('pick'),wp=document.getElementById('wasp');
if(ps&&wp){var R=JSON.parse(wp.dataset.reg);ps.addEventListener('change',function(){wp.textContent='CA$'+R[ps.selectedIndex].toFixed(2)});}
})();
