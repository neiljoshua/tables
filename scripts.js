$(function() {
	var usersList = [],
			albumsList = [],
			albumsSelected = [],
			originList;

	// Filter List of albums available in tables
	$(document).on('keyup', '.search__input', function() {
		var listId = $(this).data('search');
		var enteredKey = $(this).val();
		filter(listId, enteredKey);
	});

	$('.users__list').change(function(){
		var selectedUser = $(this).find('option:selected').attr('value'),
				list = $(this).data('select');
		loadAlbums(selectedUser, list);
	})

	// Step 7
	// $(document).on('click', '.drop-albums', function() {
	// 	dropAlbums();
	// });

	$(document).on('dragstart', '.table__row', function (e) {
    var dt = e.originalEvent.dataTransfer;
    dt.setData('Text', $(this).attr('id'));
    e.originalEvent.dataTransfer.effectAllowed = 'move';
    e.originalEvent.dataTransfer.setData("Text", e.target.getAttribute('id'));
    if ( $(this).hasClass('selected') ) {
			var list = (originList == "list1") ? "list2" : "list1";
			targetList = '#'+list;
    	steDroppableTarget(targetList);

    }
    return true;
  });

	$(document).on('dragenter dragover drop', '.table__body', function(e){
		e.preventDefault();
		if(e.type === 'drop') {
			var list = (originList == "list1") ? "list2" : "list1";
			console.log('Dropped!');
			dropAlbums();
		}
	});

	$(document).on('dragend','.table__row', function(e){
		$('.table__body').removeClass('validtarget');
		$('.table__row').removeClass('selected');
	})

	$(document).on('change', 'input[type=checkbox]',function(e){
		var albumId = $(this).val(),
				currentList = $(this).data('list');

		if( !$(this).attr('checked') ){

			if( currentList == originList || originList == null) {

				originList = currentList;
				$(this).attr('checked', true);
				albumsSelected.push(albumId);
				$(this).parent().parent().addClass('selected');

			} else if ( currentList != originList) {

				albumsSelected = [];
				$('.table__row').removeClass('selected');
				originList = currentList;
				$(this).attr('checked', true);
				albumsSelected.push(albumId);
				$(this).parent().parent().addClass('selected');

			}

		} else  {

			$(this).attr('checked', false);
			$(this).parent().parent().removeClass('selected');
			albumsSelected.splice( $.inArray(albumId, albumsSelected), 1 );

		}
	});

	function filter(listId, enteredKey) {
		var regex = new RegExp('\\b\\w*' + enteredKey + '\\w*\\b');
		$('#' +listId+ ' .table__row').hide().filter(function () {
			return regex.test($(this).data('title'));
		}).show();
	}

	function populateOptions() {

		var selects = document.querySelectorAll('.users__list'),
				users = Number(countElements(usersList));
		[].forEach.call(selects, function(select, index) {
		  for(var i=0; i < users; i++) {
				select.options[i] = new Option( usersList[i].name, usersList[i].id);
		  	if ( index == 0 && i == 0 ) {
		  		select.options[i].setAttribute('selected','true');
		  	} else if (index == 1 && i== 1 ) {
		  		select.options[i].setAttribute('selected','true');
		  	}
			}

		});

	};

	function populateAlbums() {
		var tables = document.querySelectorAll('.table__body');

		[].forEach.call(tables, function(table, index) {
			var user = table.getAttribute('data-user'),
					list = table.getAttribute('id');
			loadAlbums(user, list);
		});
	}

	// Getting Data from API
	// Store Albums data API to global variable Album
	function getAlbums() {
	  var URL ="https://jsonplaceholder.typicode.com/albums";

	  $.ajax({
		url: URL,
		dataType: "json",
		success: function(results) {
			albumsList = results;
		}
	  });
	}

	getAlbums();

	// Store Albums data API to global variable userList
	function getUsers() {
	  var URL ="https://jsonplaceholder.typicode.com/users";
	  $.ajax({
		url: URL,
		dataType: "json",
		success: function(results) {
			usersList = results;
			populateOptions();
			populateAlbums();
		}
	  });
	}

	getUsers();

	function countElements(arr) {
		var numElements = 0;
		for ( var indx in arr ) {
			numElements ++;
		}
		return numElements;
	}

	//Sorts Albums per user Id
	function loadAlbums(user,table) {
	  var counter = Number(countElements(albumsList));

		$('#' +table).empty();
	  for( var i=0; i < counter; i++) {
			var id = albumsList[i].userId,
				albumId = albumsList[i].id,
				title = albumsList[i].title;

			if( user == id) {
				$('#' +table).append('<div id="'+albumId+'" class="table__row draggable__row" draggable="true" data-album="'+albumId+'" data-user="'+id+'" data-title="'+title+'" >  <label for="album-'+albumId+'"><span>'+title+'</span> <input class="check__box" type="checkbox" name="album-id" id="album-'+albumId+'" value="'+albumId+'" data-user="'+id+'" data-list="'+table+'"></label> </div>')
			}
	  }

	}

	// Updating Api Data

	function updatingAlbumList(album, user) {
		counter = Number(countElements(albumsList));

		for( var i=0; i < counter; i++ ) {
			 if ( albumsList[i].id == album ) {
				albumsList[i].userId = user;
			 }
		}

	}

	function updateTables() {
		var tables = document.querySelectorAll('.table__body');

		[].forEach.call(tables, function(table, index) {
			var user = table.getAttribute('data-user'),
					list = table.getAttribute('id');
			loadAlbums(user, list);
			albumsSelected = [];
		});

	}

	function updateAlbums(album, user) {

		var URL ="https://jsonplaceholder.typicode.com/albums/"+album,
				list = (originList == "list1") ? "list2" : "list1",
				newUserId = $('#' +list).data('user');
		$.ajax({
			url: URL,
			method: 'PUT',
			dataType: "json",
			data: '{"userId": ' + newUserId + '}',
			contentType: 'application/json',
			headers: {"Content-type": "application/json; charset=UTF-8"},
			beforeSend: function() {
			},
			success: function(response) {
				var userId = response.userId;
				updatingAlbumList(album, userId);
				updateTables();
			}
		});

	}

	function dropAlbums() {
		albumsSelected.forEach(function(item, index) {
			updateAlbums(item, originList)
		})
	}

	function steDroppableTarget(targetList) {
		if( targetList == '#list1') {
			$('#list1').addClass('validtarget');
			$('#list1 .table__row').attr('draggable', false);
		} else if (targetList == '#list2') {
			$('#list2').addClass('validtarget');
			$('#list2 .table__row').attr('draggable', false);
		}
	}

});
