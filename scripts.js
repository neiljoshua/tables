$(function() {
    var albumsSelected = [],
        originTableName,
        originListName,
        usersList,
        Albums = [],
        albumDragged,
        dragAlbum,
        id;

    // Filter Albums available in tables
    $(document).on('keyup','#albumList1',function(){
		    var selectAlbum = $(this).val();
		    filter1(selectAlbum);
		});

    function filter1(e) {
		    var regex = new RegExp('\\b\\w*' + e + '\\w*\\b');
		    $('#List1 .table__row').hide().filter(function () {
		        return regex.test($(this).data('name'));
		    }).show();
		}

		$(document).on('keyup', '#albumList2',function(){
		    var selectAlbum = $(this).val();
		    filter2(selectAlbum);
		});

		function filter2(e) {
		    var regex = new RegExp('\\b\\w*' + e + '\\w*\\b');
		    $('#List2 .table__row').hide().filter(function () {
		        return regex.test($(this).data('name'));
		    }).show();
		}

		// Getting Data from API
    function getAlbums() {
      var URL ="https://jsonplaceholder.typicode.com/albums";

      $.ajax({
        url: URL,
        dataType: "json",
        success: function(results) {
            Albums = results;
        }
      });
    }

    getAlbums();

    function getUsers() {
      var URL ="https://jsonplaceholder.typicode.com/users";
      $.ajax({
        url: URL,
        dataType: "json",
        success: function(results) {
            usersList = results;
        }
      });
    }

    getUsers();

    // Updating Api Data
    function updateAlbums(album, user) {

    	var URL ="https://jsonplaceholder.typicode.com/albums/"+album,
    			userId = user

    	$.ajax({
        url: URL,
        method: 'PUT',
        dataType: "json",
        data: '{"userId": 2}',
        contentType: 'application/json',
        // headers: {"X-HTTP-Method-Override": "PUT"},
        headers: {"Content-type": "application/json; charset=UTF-8"},
        success: function(response) {
           console.log('response', response);
        }
      });

    }

    function countElements(arr) {
        var numElements = 0;
        for ( var indx in arr ) {
            numElements ++;
        }
        return numElements;
    }

    function filterAlbums(user, element) {
      var table = element,
          counter = Number(countElements(Albums));

      for( var i=0; i < counter; i++) {
        var id = Albums[i].userId,
            albumId = Albums[i].id,
            title = Albums[i].title;

        if( user == id) {
            table.append('<div class="table__row draggable__row" draggable="true" data-album="'+albumId+'" data-user="'+id+'" data-title="'+title+'"> <div class="table__cell table__cell--short album__id">'+albumId+'</div> <div class="table__cell table__cell album__name">'+title+'</div> </div>')
        }
      }

    }

    $('div.table__body').each(function getUsers() {

	    var element = $(this),
	        userId = element.data('user'),
	        URL ="https://jsonplaceholder.typicode.com/users/"+userId;

	    $.ajax({
	        url: URL,
	        dataType: "json",
	        success: function(results) {
	          var id =(results.id),
	              name = (results.name);
	          element.parent().find('.user_id').html(id);
	          element.parent().find('.user_name').html(name);
	          filterAlbums(userId, element)
        	}
      });
    });

    // Handling Drag and Drop

    function handleDrag(e,list) {
    	e.originalEvent.effectAllowed = 'move';
    	e.originalEvent.dataTransfer.setData('text/plain', e.originalEvent.target.textContent);
    	console.log("data on drag e ", e);
    	if( list == 'List1' ) {
    	 		$('#List2').addClass('validtarget');
    	 		$('#List2').on('dragenter', handleDragEnter(e));
    	 		$('#List2').on('dragleave', handleDragLeave(e));
    	 		$('#table2').on('dragover', handleDragOverOuter(e));
    	 		$('#list2').on('dragover', handleDragTable2(e));
    	 }
    	 else if ( list == 'List2' ) {
    	 		$('#List1').addClass('validtarget');
    	 		$('#List1').on('dragenter', handleDragEnter(e));
    	 		$('#List1').on('dragleave', handleDragLeave(e));
    	 		$('#table1').on('dragover', handleDragOverOuter(e));
    	 		$('#list1').on('dragover', handleDragTable1(e));
    	 }
    	 return true;
    }

    function handleDragEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    function handleDragLeave(e) {
        return false;
    }

    function handleDragOverOuter(e) {
    	var hola = $(this);
    	e.originalEvent.stopPropagation();
    	return false;
    }


    function handleDragTable1(e) {
    	e.originalEvent.dataTransfer.dropEffect = "move";
    	e.originalEvent.stopPropagation();
    	e.originalEvent.preventDefault();
    	$('#table1List').addClass('validtarget');
    	return false;

    }

    function handleDragTable2(e) {
    	e.originalEvent.dataTransfer.dropEffect = "move";
    	e.stopPropagation();
    	e.preventDefault();
    	$('#table2List').addClass('validtarget');
    	return false;

    }

    function handleDrop(e) {
    	e.preventDefault();
    	e.stopPropagation();

    	var dropTarget = e.target.innerText;

    	return false;

    }

    function disableDragTable(elem) {
    	if ( elem == 'List1' && elem == originListName ) {
    		 $('#List2 .table__row').removeClass('draggable__row');
         $('#List2 .table__row').attr('draggable','False');
    		 $('#List1 .table__row').attr('draggable',"True");
    		 $('#List1 .table__row').addClass('draggable__row');
      }
      else if (elem == 'List2' && elem == originListName ) {
       	 $('#List1 .table__row').removeClass('draggable__row');
       	 $('#List1 .table__row').attr('draggable','False');
    		 $('#List2 .table__row').attr("draggable","True");
       	 $('#List2 .table__row').addClass('draggable__row');
      }
    }

    $(document).on('click', '.draggable__row', function(e) {
        e.preventDefault();
        var currentList = $(this).parent().attr('id'),
        		currentTable = $(this).parent().parent().attr('id'),
					  albumId = $(this).data('album'),
					  title  = $(this).data('title');

        if ( originListName == null || originListName == currentList ) {
            var rowSelected = $(this);
            if ( $(this).hasClass('selected') ) {
                $(this).removeClass('selected');
            } else {
                $(this).addClass('selected');
            }
		        disableDragTable(currentList);
        }

        if (  $.isEmptyObject(albumsSelected) ) {
						originListName = null;
						$('#List1 .table__row').addClass('draggable__row');
						$('#List2 .table__row').addClass('draggable__row');
        }

    });

	  $(document).on('mouseup', '.draggable__row', function (e) {

	  	var userId = $(this).data('user'),
	  			albumId = $(this).data('album');
			updateAlbums(albumId,userId);

     	var row = $(this);
     	var originTableName = $(this).parent().attr('id');

     	if( originTableName == 'List1' ) {
     		handleDrop(e);

     	}
     	else if ( originTableName == 'List2' ) {
     		handleDrop(e);
     	}

	  });

});
