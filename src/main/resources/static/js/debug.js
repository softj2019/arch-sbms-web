
$(function(){

  if(isQueryParamActive("m")){
    $('.m_btn_menu').click();
  }

})

function isQueryParamActive(name){
  const params = new URLSearchParams(window.location.search);
  const param = params.get(name);
  return "y,1,on,true".split(',').includes(param);
}

