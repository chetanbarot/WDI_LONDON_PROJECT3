console.log("JS linked!")

var EmpireApp = EmpireApp || {};

EmpireApp.API_URL = "/api";

EmpireApp.setRequestHeader = function(jqXHR) {
  var token = window.localStorage.getItem("token");
  if(!!token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
}

EmpireApp.getTemplate = function(template, data) {
  return $.get('./templates/' + template + '.html').done(function(templateHtml) {
    var html = _.template(templateHtml)(data);
    EmpireApp.$main.html(html);
    EmpireApp.updateUI();

  });
}

EmpireApp.getUser = function() {
  event.preventDefault();
  console.log("firing get")
  return $.ajax({
    method: "GET",
    
    url: EmpireApp.API_URL+"/show"
  }).done(function(data){
    EmpireApp.getTemplate("show", {user: data});
  });
}

EmpireApp.handleForm = function(){
  event.preventDefault();
  console.log("going to url");
  $(this).find('button').prop('disabled', true);

  var data = $(this).serialize();
  var method = $(this).attr("method");

  var url = EmpireApp.API_URL + $(this).attr("action");


  return $.ajax({
    url: url,
    method: method,
    data: data,
    beforeSend: EmpireApp.setRequestHeader
  })
  .done(function(data){
    if(!!data.token){
      window.localStorage.setItem("token", data.token);
    }
    EmpireApp.$main.removeClass('active');
  })

  .fail(EmpireApp.handleFormErrors);
}

EmpireApp.handleFormErrors = function(jqXHR){
  console.log("going to url");
  var $form = $("form");
  for(field in jqXHR.responseJSON.errors){
     $form.find('input[name=' + field + ']').parents('.form-group').addClass('has-error');
   }
   $form.find('button').removeAttr('disabled');

 }

EmpireApp.logout = function(){
  event.preventDefault();
  window.localStorage.clear();
  console.log("logout");
  EmpireApp.updateUI();
  this.getTemplate('splash');
}

EmpireApp.isLoggedIn = function() {
  return !!window.localStorage.getItem("token");
}

EmpireApp.updateUI = function() {
  if(EmpireApp.isLoggedIn()) {
    $('.logged-in').removeClass("hidden");
    $('.logged-out').addClass("hidden");
  } else {
   $('.logged-in').addClass("hidden");
   $('.logged-out').removeClass("hidden"); 
  }
}

EmpireApp.loadPage = function(){
  event.preventDefault();
  EmpireApp.getTemplate($(this).data('template'));
}

EmpireApp.initEventHandlers = function() {
  this.$main = $("main");
  this.$main.on("submit", "form", this.handleForm);


  this.$main.on('click', '#play', function() {
    event.preventDefault();

    if(EmpireApp.isLoggedIn()) {
      EmpireApp.$main.removeClass('active');
    } else {
      EmpireApp.getTemplate('login');
    }
  });

  $(".navbar-nav a").not(".logout").on("click", this.loadPage);
  this.$main.on("click", ".accessButton", this.loadPage);
  $("back btn btn-primary").on("click", this.logout);
  $("logout logged-in btn btn-danger").on("click",window.localStorage.clear(), this.logout);
  this.$main.on("focus", "form input", function(){
    $(this).parents('.form-group').removeClass('has-error');
  })
}

EmpireApp.init = function(){
  this.initEventHandlers();
  this.getTemplate('splash');
  this.updateUI();

}.bind(EmpireApp);


$(EmpireApp.init);