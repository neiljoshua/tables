$(function() {
	var usersList = [],
			albumsList = [],
			albumsSelected = [],
			originList,
			targetList;

	$(document).on('keyup', '.search__input', searchInput);

	function searchInput() {
		var listId = $(this).data('search');
		var enteredKey = $(this).val();
		filter(listId, enteredKey);
	}

	$('.users__list').change(function(){
		var selectedUser = $(this).find('option:selected').attr('value'),
				userAlbums = $(this).data('select');

		loadAlbums(selectedUser, userAlbums);
	})

	$(document).on('dragstart', '.table__row', function (e) {
    var dt = e.originalEvent.dataTransfer,
    	activeAlbum = $(this).find('.check__box');
    validateTarget(activeAlbum);

    dt.setData('Text', $(this).attr('id'));
    e.originalEvent.dataTransfer.dropEffect = 'move';
    e.originalEvent.dataTransfer.setData("Text", e.target.getAttribute('id'));

    if ( $(this).hasClass('selected') ) {
				var targetList = (originList == "list1") ? "list2" : "list1";

	    	$('#'+targetList).addClass('valid__target');
				$('#'+targetList+' .table__row').attr('draggable', false);
				$('#'+originList).removeClass('valid__target');
    }

    return true;
  });

	$(document).on('drag dragenter drop dragover', '.table__body', function(e) {
		if(e.type === 'drag') {
			return false;
		}
		if(e.type === 'dragenter') {
			e.preventDefault();
			return true;
		}
		if(e.type === 'dragover') {
			e.preventDefault();
			return false;
		}
		if(e.type === 'drop') {
			var targetList = e.currentTarget.id,
					originList = (targetList == "list1") ? "list2" : "list1";
			if( originList != targetList ) {
				$('#'+originList+' table__row').removeClass('selected');
				dropAlbums();
			}
		}
	});

	$(document).on('dragend','.table__row', function(e){
		$('.table__body').removeClass('valid__target');
		$('.table__row').removeClass('selected');
		$('.check__box').attr('checked', false);
	})


	function validateTarget($this) {
		var currentList = $this.data('list'),
		 	albumId = $this.closest('.table__row').data('album');

		if( currentList == originList || originList == null) {
			originList = currentList;
			albumsSelected.push(albumId);
			$this.closest('.table__row').addClass('selected');

		} else if ( currentList != originList) {
			albumsSelected = [];
			$('.table__row').removeClass('selected');
			originList = currentList;
			albumsSelected.push(albumId);
			$this.closest('.table__row').addClass('selected');
		}
	}

	$(document).on('change', 'input[type=checkbox]',function(e){
		var albumId = $(this).val(),
				currentList = $(this).data('list');

		validateTarget($(this));

		if( !$(this).attr('checked') ){

			if( currentList == originList || originList == null) {
				$(this).attr('checked', true);

			} else if ( currentList != originList) {
				$(this).attr('checked', true);

			}

		} else  {
			$(this).attr('checked', false);
			$(this).closest('.table__row').removeClass('selected');
			albumsSelected.splice( $.inArray(albumId, albumsSelected), 1 );

		}
	});

	function filter(listId, enteredKey) {
		var regex = new RegExp('\\b\\w*' + enteredKey + '\\w*\\b');

		$('#' +listId+ ' .table__row').hide().filter(function () {
			return regex.test($(this).data('title'));
		}).show();
	}

	function populateUsers() {
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
			success: function(results) {
				usersList = results;
				populateUsers();
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
	function loadAlbums(user, table) {
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


	function updatingAlbumList(album, user) {
		counter = Number(countElements(albumsList));

		for( var i=0; i < counter; i++ ) {
			 if ( albumsList[i].id == album ) {
				albumsList[i].userId = user;
			 }
		}

	}

	// Update tables with new user albums
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

			success: function(response) {
				var userId = response.userId;
				updatingAlbumList(album, userId);
				updateTables();
			}
		});

	}

	// Update albums on drop
	function dropAlbums() {
		albumsSelected.forEach(function(item, index) {
			updateAlbums(item, originList)
		})
	}

});
