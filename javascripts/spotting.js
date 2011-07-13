$(function() {
	
	var tracks;
	
	$('#example').click(function(e) {
	  e.preventDefault();
	  $.get('brits.txt', function(data) {
	    $('#tracklist textarea').val(data);
	  })
	})
	
	$('#spotting').submit(function(e) {
		e.preventDefault();
		tracks = $.map($.unique($('#tracklist').val().split('\n')), function(track) {
			return /\w/.exec(track) ? trimCrap(track) : null; 
		});
		$('#status').text(tracks.length + ' lines may contain tracks...');
		if (tracks.length == 0) {
			alert('Enter some tracks, mate.');
			return;
		}

		var result, results = [], resultsCount = 0, foundResultsCount = 0, track;

		$.spotifydata('search', tracks, function lambda(data) {
			result = {};
			result['info'] = data.info;
			if (data.tracks.length > 0) {
				result['track'] = $.spotifydata('filter', data.tracks, $('#countries').val(), 1)[0];
				if (!result.track) {
					result['unavailableTrack'] = data.tracks[0];
				}
				result['result'] = data.tracks.indexOf(result.track) + 1;
			} else {
				var altQuery = result.info.query.replace(/(\(|\[).+(\)|\])/,'');

				if (altQuery != result.info.query) {
					$.spotifydata('search', altQuery, lambda);
				}
			}
			results[resultsCount++] = result;
			result['found'] = !!result.track;
			if (result.track) {
				foundResultsCount++;
			}
			$('#status').text('We found ' + foundResultsCount + ' of '+ resultsCount +' available in ' + $('#countries :selected').text() + '.');
			showResults(results);
		})
	})

	$('#copylinks').click(function() {
		$('#links').find('textarea').select();
	})
	
	function trimCrap(line) {
    return (typeof line == 'string') ? $.trim(line).replace(/ \W /gi, ' ').replace(/\s+/gi, ' ') : line;
  }

	function showResults(results) {
		var tracksFound = '',
		 tracksNotFound = '',
			  spotLinks = '',
			  artists,
			  track;
			  			
		if (results.length) {
			$('#results').show();
		}
		$.each(results, function(i, json) {
			if (!json.track) {
				tracksNotFound += '<li><a href="spotify:search:' + json.info.query + '">' + json.info.query + '</a></li>';
			} else {
				artists = '<span class="artist">' + $.map(json.track.artists, function(artist) { return artist.name }).join(', ') + '</span>';
				track = '<li><a class="track" href="'+ json.track.href +'"><span class="name">' + json.track.name + '</span> by <span class="artists">' + artists + '</span></a>';
				if (json.result > 1) {
					track += ' (result #' + json.result + ')';
				}
				track += '</li>'
				tracksFound += track;
				spotLinks += json.track.href + '\n';
			}
		})
		$('#tracks').find('ul').html(tracksFound);
		$('#notfound').find('ul').html(tracksNotFound);

		if (spotLinks != '') {
		 	$('#links').show().find('textarea').val(spotLinks).attr('rows', results.length);
		}
		$.each(['#tracks', '#notfound'], function(i, el) {
		  if ($(el).find('ul').children().length > 0) {
		    $(el).show();
		  } else {
		    $(el).hide();
		  }
		})
	}
});
