$(function() {
	var users_List = [],
			albums_List = [],
			albums_Selected = [],
			active_User,
			drag_Src_El = null;

	// Filter List of albums available in tables
	// Filtering in table 1
	$(document).on('keyup','#albumList1',function(){
		var selected_Album = $(this).val();
		filter1(selected_Album);
	});

	// Filtering in table 2
	$(document).on('keyup','#albumList2',function(){
		var selected_Album = $(this).val();
		filter2(selected_Album);
	});

	$(document).on('click', '.drop-albums', function() {
		dropAlbums();
	});

	$(document).on('dragstart', '.table__row', function(e) {
		console.log('event', e );
		if ( $(this).hasClass('selected') ) {
			var list = (active_User == 1) ? 2 : 1;
			origin_list = '#List'+active_User;
			target_list = '#List'+list;
			e.originalEvent.dataTransfer.effectAllowed = 'move';
	    e.originalEvent.dataTransfer.setData("Text", e.target.getAttribute('id'));
	    // e.originalEvent.dataTransfer.setDragImage(e.target,0,0);
	    droppable_Table(target_list);
			return true;
		}

	})

	$(document).on('drag', '#List1 .table__row', function(e) {
		 if (e.originalEvent.preventDefault) {
	    e.originalEvent.preventDefault(); // Necessary. Allows us to drop.
	  }
	  console.log('Dragging!');
	});

	$(document).on('drag', '#List2 .table__row', function(e) {
		 if (e.originalEvent.preventDefault) {
	    e.originalEvent.preventDefault(); // Necessary. Allows us to drop.
	  }
	  console.log('Dragging!');
	   // See the section on the DataTransfer object.

	});

	$('#List1').on('dragover',function(e){
		e.originalEvent.dataTransfer.dropEffect = "move";
	  e.originalEvent.stopPropagation();
	  e.originalEvent.preventDefault();
		return false;
	});

	$('#List2').on('dragover',function(e){
		e.originalEvent.dataTransfer.dropEffect = "move";
	  e.originalEvent.stopPropagation();
	  e.originalEvent.preventDefault();
		return false;
	});

	$('#List1').on('drop', function(e){
		console.log('Freaking Dropped!');
		dropAlbums();
		$('#List2 .table__row').removeClass('selected');
		$('.table__body').removeClass('validtarget');
		$('.table__body .table__row').attr('draggable', true);
	});

	$('#List2').on('drop', function(e){
		console.log('Freaking Drop!');
		dropAlbums();
		$('#List1 .table__row').removeClass('selected');
		$('.table__body').removeClass('validtarget');
		$('.table__body .table__row').attr('draggable', true);
	});

	$(document).on('change', 'input[type=checkbox]',function(e){
		var album_Id = $(this).val(),
				current_User = $(this).data('user');

		if( !$(this).attr('checked') ){

			if( current_User == active_User || active_User == null) {

				active_User = current_User;
				$(this).attr('checked', true);
				albums_Selected.push(album_Id);
				$(this).parent().parent().addClass('selected');

			} else if ( current_User != active_User) {

				albums_Selected = [];
				$('.table__row').removeClass('selected');
				active_User = current_User;
				$(this).attr('checked', true);
				albums_Selected.push(album_Id);
				$(this).parent().parent().addClass('selected');

			}

		} else  {

			$(this).attr('checked', false);
			$(this).parent().parent().removeClass('selected');
			albums_Selected.splice( $.inArray(album_Id,albums_Selected),1 );

		}
	});

	function filter1(e) {
		var regex = new RegExp('\\b\\w*' + e + '\\w*\\b');
		$('#List1 .table__row').hide().filter(function () {
			return regex.test($(this).data('title'));
		}).show();
	}

	function filter2(e) {
		var regex = new RegExp('\\b\\w*' + e + '\\w*\\b');
		$('#List2 .table__row').hide().filter(function () {
			return regex.test($(this).data('title'));
		}).show();
	}

	// Getting Data from API
	// Store Albums data API to global variable Album
	function getAlbums() {
	  var URL ="https://jsonplaceholder.typicode.com/albums";

	  $.ajax({
		url: URL,
		dataType: "json",
		success: function(results) {
			albums_List = results;
		  // console.log(albums_List);
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
			users_List = results;
		}
	  });
	}

	getUsers();

	function countElements(arr) {
		var num_Elements = 0;
		for ( var indx in arr ) {
			num_Elements ++;
		}
		return num_Elements;
	}

	//Sorts Albums per user Id
	function loadAlbums(user, element) {
	  var table = element,
		  counter = Number(countElements(albums_List));

		table.empty();
	  for( var i=0; i < counter; i++) {
			var id = albums_List[i].userId,
				album_Id = albums_List[i].id,
				title = albums_List[i].title;

			if( user == id) {
				table.append('<div class="table__row draggable__row" draggable="true" data-album="'+album_Id+'" data-user="'+id+'" data-title="'+title+'"> <div class="table__cell table__cell--short album__id">'+album_Id+'</div> <div class="table__cell table__cell album__name"> '+title+' </div> <label for="album-'+album_Id+'">'+title+' <input class="check__box" type="checkbox" name="album-id" id="album-'+album_Id+'" value="'+album_Id+'" data-user="'+id+'"></label> </div>')
			}
	  }

	}

	// loads users and albums per user
	$('div.table__body').each(function getUsers() {

		var element = $(this),
			user_Id = element.data('user'),
			URL ="https://jsonplaceholder.typicode.com/users/"+user_Id;

		$.ajax({
			url: URL,
			dataType: "json",
			success: function(results) {
			  var id =(results.id),
				  name = (results.name);
			  element.parent().find('.user_id').html(id);
			  element.parent().find('.user_name').html(name);
			  loadAlbums(user_Id,element);
			}
	  });
	});

	// Updating Api Data

	function updatingAlbumList(album, user) {
		counter = Number(countElements(albums_List));
		for( var i=0; i < counter; i++ ) {
			 if ( albums_List[i].id == album ) {
				albums_List[i].userId = user;
			 }
		}
	}

	function updateTables() {
		$('div.table__body').each(function(){
			var element = $(this),
			userId = element.data('user');
			loadAlbums(userId,element);
			albums_Selected = [];
		});
	}

	function updateAlbums(album, user) {

		var URL ="https://jsonplaceholder.typicode.com/albums/"+album,
				newUserId = (user == 1) ? 2 : 1;

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
				updatingAlbumList(album, userId); // run on dragging ?
				updateTables(); //run on dropping ?
			}
		});

	}

	function dropAlbums() {
		albums_Selected.forEach(function(item, index) {
			console.log('item', item)
			console.log('index', index)
			updateAlbums(item, active_User)
		})
	}

	function droppable_Table(target_List) {
		console.log(target_List);
		if( target_List == '#List1') {
			// $('#List2').attr({ondragenter:'handleDragEnter(e)',ondrop:'handleDrop(e)',ondragover:'handleDragOver(e)'});
			$('#List1').addClass('validtarget');
			$('#List1 .table__row').attr('draggable', false);
		} else if (target_List == '#List2') {
			// $('#List1').attr({ondragenter:'handleDragEnter(e)',ondragover:'handleDragOver(e)',ondrop:'handleDrop(e)'});
			$('#List2').addClass('validtarget');
			$('#List2 .table__row').attr('draggable', false);
		}
	}

});
