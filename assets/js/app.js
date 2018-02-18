$(document).ready(() => { 
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $('#auth').hide();
      $('header').show();
      $('#home').show();
    } else {
      $('header').hide();
      $('#home').hide();
      $('#login-btn').click(login);
      $('#signup-btn').click(signup);
    }
  }); // firebase
});

var difficulty = '';
var category = '';

function login() {
  let email = $('#email').val();
  let pw = $('#pw').val();
  if (email !== '' && pw !== '') {
    const promise = firebase.auth().signInWithEmailAndPassword(email, pw);
    promise.catch(e => alert(e.message));
  }
}

function signup() {
  let email = $('#email').val();
  let pw = $('#pw').val();
  if (email !== '' && pw !== '') {
    const promise = firebase.auth().createUserWithEmailAndPassword(email, pw);
    promise.catch(e => alert(e.message));
  }
}

// por defecto o cuando escoge usuario

function start() {
  let type = getType();
  console.log("START", { 'category' : category, 'difficulty' : difficulty, 'type' : type});

  let url = `https://opentdb.com/api.php?amount=10`;

  if (category !== '') {
    url += `&category=${category}`;
  }

  if (difficulty !== '') {
    url += `&difficulty=${difficulty}`;
  }

  if (type !== '') {
    url += `&type=${type}`;
  }
  // ejemplo: https://opentdb.com/api.php?amount=10&category=3&difficulty=easy&type=boolean
  $('#home').hide();
  $('#game').show();

  const gameData = fetch(url)
    .then(response => response.json())
    .then(data => {
      /*console.log(data);*/
      let counter = 0;
      getQuestion(data.results, counter++);
      $('#game').on('click', '.get_question', function() {
        getQuestion(data.results, counter++);
        // se pasa como argumento los resultados (preguntas+respuestas)
        // y el counter inicializado en 0 aumentando de uno en uno
        // esto es para que cada vez que el usuario responda una pregunta automáticamente avance a la siguiente
      });
    });
}

// función para obtener parámetros de tipo (multiple/boolean) y dificultad (easy/medium/hard)
// que irán dentro de la llamada a la api

// los checkboxes de type-mult y type-boolean están en el menu del nav

// se le da como parámetro el botón en el cual se desencadenó el evento (easy - medium - hard)
function parameters(event) {
  let difficulty = $(this).val(); // se usa el valor del boton presionado
  if ($('#type-mult').is(':checked') && $('#type-boolean').is(':checked')) {
    start('', difficulty); 
    // si se chequean ambos no se pasa ningún texto como parámetro para que la api entregue 
    // resultados aleatorios + la dificultad obtenida del botón en el que se desencadenó el evento
  } else if ($('#type-mult').is(':checked')) {
    start('&type=multiple', difficulty); 
    // si se chequea type-mult se pasa como parámetro multiple para que la api solo entregue 
    // preguntas de selección multiple + la dificultad
  } else if ($('#type-boolean').is(':checked')) {
    start('&type=boolean', difficulty);
    // si se chequea type-boolean se pasa como parámetro boolean para que la api solo entregue
    // preguntas de verdadero o falso
  }
};

function getType() {
  if ($('#type-mult').is(':checked') && $('#type-boolean').is(':checked')) {
    return ''; 
    // si se chequean ambos no se pasa ningún texto como parámetro para que la api entregue 
    // resultados aleatorios + la dificultad obtenida del botón en el que se desencadenó el evento
  } else if ($('#type-mult').is(':checked')) {
    return 'multiple'; 
    // si se chequea type-mult se pasa como parámetro multiple para que la api solo entregue 
    // preguntas de selección multiple + la dificultad
  } else if ($('#type-boolean').is(':checked')) {
    return 'boolean';
    // si se chequea type-boolean se pasa como parámetro boolean para que la api solo entregue
    // preguntas de verdadero o falso
  }
}

// todas las categorias
function getCategories() {
  const categories = fetch('https://opentdb.com/api_category.php'); 
  // se llama a la api por primera vez para obtener la lista de categorías disponibles
  categories
    .then(response => response.json())
    .then(data => {
      $.each(data.trivia_categories, function(i, category) {
        let inCategory = `<div class="col-md-3 col-xs-12"><button data-id="${category.id}" value="${category.id}" class="btn btn-default get_question btn-categories"><i class="fa fa-check inactivo"></i>${category.name}</button></div>`
        $('#categories-select').append(inCategory);
      });

      $('.btn-categories').click(setCategorie);
    });
}

// juego listo para comenzar
function getQuestion(data, counter) {
  $('#game').empty(); // se vacía el contenedor para rellenarlo con las preguntas del juego
  $('#game').append(`<h2 class="text-center">${data[counter].question}</h2>`); // se apendiza la pregunta
  let arrQ = []; // nuevo arreglo para meter las respuestas
  data[counter].incorrect_answers.forEach((wrong) => {
    arrQ.push(`<div class="col-6 text-center"><button class=" btn btn-default q_w">${wrong}</button></div>`);
  });
  // las respuestas incorrectas llevan la clase q_w
  arrQ.push(`<div class="col-6 text-center"><button class="btn btn-default q_r">${data[counter].correct_answer}</button></div>`);
  // la respuesta correcta lleva la clase q_r
  $('#game').append('<div class="row"></div>');
  console.log(arrQ) // se apendiza ul para meter las respuestas
  arrQ.forEach((answer) => {
    console.log(answer)
    randomize($('#game .row').append(answer));
    // se entregan las respuestas apendizadas a la función randomize 
    // para que las ponga en orden aleatorio
  });

  $('#game').append('<div class="result"></div>');
  // eventos para cuando el usuario aprete las respuestas incorrectas o la correcta
  $('.q_w').on('click', wrongAnswer);
  $('.q_r').on('click', rightAnswer);
}

function rightAnswer() {
  $('#game .result').html('<h2 class="text-center">Right!</h2><button class="btn btn-success get_question next">Next question</button>');
  $('#game ul button').attr('disabled', true);
}

function wrongAnswer() {
  $('#game .result').html('<h2 class="text-center">Wrong!</h2><button class="btn btn-danger get_question next">Next question</button>');
  $('#game ul button').attr('disabled', true);
}

// orden aleatorio de las respuestas en cada pregunta
function randomize() {
  const parent = $('#game ul');
  const lis = parent.children();
  while (lis.length) {
    parent.append(lis.splice(Math.floor(Math.random() * lis.length), 1)[0]);
  }
}

function setDifficulty(event) {
  difficulty = $(this).val();
  setClassDifficulty();
}


//agregando clases para la seleccion de dificultad
function setClassDifficulty() {
  $('.btn-difficulty').each(function(index, el) {
    if ($(el).val() == difficulty) {
      $(el).find('i').removeClass('inactivo');
      $(el).find('i').addClass('activo');
    } else {
      $(el).find('i').removeClass('activo');
      $(el).find('i').addClass('inactivo');
    }
  });
}

$('.btn-difficulty').click(setDifficulty);

function setCategorie(event) {
  category = $(this).val();
  console.log(category);
  setClassCategories();
}

function setClassCategories() {
  $('.btn-categories').each(function(index, el) {
    if ($(el).val() == category) {
      $(el).find('i').removeClass('inactivo');
      $(el).removeClass('btn-default');
      $(el).find('i').addClass('activo');
      $(el).addClass('btn-primary');
    } else {
      $(el).find('i').removeClass('activo');
      $(el).removeClass('btn-primary');
      $(el).find('i').addClass('inactivo');
      $(el).addClass('btn-default');
    }
  });
}

// por defaut categoria all y dificultad normal
function setDefaultValues() {
  difficulty = 'medium';
  setClassDifficulty();
  category = '';
  setClassCategories();
}


// Jugar
$('#btn-play').click(start);

getCategories();
setDefaultValues();