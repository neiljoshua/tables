$(function() {
	var users_list = [],
			albums_list = [],
			albums_selected = [],
			active_user;

	// Filter List of albums available in tables
	// Filtering in table 1
	$(document).on('keyup','#album-list1',function(){
		var selected_Album = $(this).val();
		filter1(selected_Album);
	});

	// Filtering in table 2
	$(document).on('keyup','#album-list2',function(){
		var selected_Album = $(this).val();
		filter2(selected_Album);
	});

	$(document).on('click', '.drop-albums', function() {
		dropAlbums();
	});

	$(document).on('dragstart', '.draggable__row' ,function (e) {
    var dt = e.originalEvent.dataTransfer;
    dt.setData('Text', $(this).attr('id'));
    e.originalEvent.dataTransfer.effectAllowed = 'move';
    e.originalEvent.dataTransfer.setData("Text", e.target.getAttribute('id'));
    console.log(e.originalEvent.dataTransfer.items.length)
    debugger
    if ( $(this).hasClass('selected') ) {
			var list = (active_user == 1) ? 2 : 1;
			target_list = '#List'+list;
    	droppable_Table(target_list);
    }
    return true;
  });

	$(document).on('dragenter dragover drop', '.table__body',function(e){
		console.log('albums on drag', albums_selected)
		e.preventDefault();
		if(e.type === 'drop') {
			dropAlbums();
		}
	});

	$(document).on('dragend','.draggable__row', function(e){
		$('.table__body').removeClass('validtarget');
		$('.table__row').removeClass('selected');
	})

	$(document).on('change', 'input[type=checkbox]',function(e){
		var album_id = $(this).val(),
				current_user = $(this).data('user');

		if( !$(this).attr('checked') ){

			if( current_user == active_user || active_user == null) {

				active_user = current_user;
				$(this).attr('checked', true);
				albums_selected.push(album_id);
				console.log('albums on checked', albums_selected)
				$(this).parent().parent().addClass('selected');

			} else if ( current_user != active_user) {

				albums_selected = [];
				$('.table__row').removeClass('selected');
				active_user = current_user;
				$(this).attr('checked', true);
				albums_selected.push(album_id);
				$(this).parent().parent().addClass('selected');

			}

		} else  {

			$(this).attr('checked', false);
			$(this).parent().parent().removeClass('selected');
			albums_selected.splice( $.inArray(album_id,albums_selected),1 );

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
			albums_list = results;
		  // console.log(albums_list);
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
			users_list = results;
		}
	  });
	}

	getUsers();

	function countElements(arr) {
		var num_elements = 0;
		for ( var indx in arr ) {
			num_elements ++;
		}
		return num_elements;
	}

	//Sorts Albums per user Id
	function loadAlbums(user, element) {
	  var table = element,
		  counter = Number(countElements(albums_list));

		table.empty();
	  for( var i=0; i < counter; i++) {
			var id = albums_list[i].userId,
				album_id = albums_list[i].id,
				title = albums_list[i].title;

			if( user == id) {
				table.append('<div id="'+album_id+'" class="table__row draggable__row" draggable="true" data-album="'+album_id+'" data-user="'+id+'" data-title="'+title+'"> <div class="table__cell table__cell--short album__id">'+album_id+'</div> <div class="table__cell table__cell album__name"> '+title+' </div> <label for="album-'+album_id+'">'+title+' <input class="check__box" type="checkbox" name="album-id" id="album-'+album_id+'" value="'+album_id+'" data-user="'+id+'"></label> </div>')
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
		counter = Number(countElements(albums_list));
		for( var i=0; i < counter; i++ ) {
			 if ( albums_list[i].id == album ) {
				albums_list[i].userId = user;
			 }
		}
	}

	function updateTables() {
		$('div.table__body').each(function(){
			var element = $(this),
			userId = element.data('user');
			loadAlbums(userId,element);
			albums_selected = [];
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
		albums_selected.forEach(function(item, index) {

			updateAlbums(item, active_user)
		})
	}

	function droppable_Table(target_List) {
		console.log(target_List);
		if( target_List == '#List1') {
			$('#List1').addClass('validtarget');
			$('#List1 .table__row').attr('draggable', false);
		} else if (target_List == '#List2') {
			$('#List2').addClass('validtarget');
			$('#List2 .table__row').attr('draggable', false);
		}
	}

});
