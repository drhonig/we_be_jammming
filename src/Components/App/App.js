import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify'; 



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],

      playlistName: 'my playlist',

      playlistTracks: [],
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  componentWillMount() {
    console.log("process", process.env);
    Spotify.getAccessToken();
  }

  addTrack(track) {
    if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    } else {
      this.state.playlistTracks.push(track);
      this.setState({ playlistTracks: this.state.playlistTracks });
    }
  };

  removeTrack(track) {
    let newTracks = this.state.playlistTracks.filter((playlistTrack) => {
      return playlistTrack.id !== track.id;
    })
    this.setState({ playlistTracks: newTracks });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(playlistTrack => playlistTrack.URI);
    Spotify.savePlaylist(this.state.playlistName, trackURIs)
      this.setState({
        playlistName: 'New Playlist',
        playlistTracks: []
      });
  }

  search(term) {
    Spotify.search(term).then(searchResults => {
      this.setState({ searchResults: searchResults })
    });
  }


  render() {
    console.log(this.state.playlistName)
      return (
          <div>
            <h1>Ja<span className="highlight">mmm</span>ing</h1>
            <div className="App">
              <SearchBar onSearch={this.search}/>
              <div className="App-playlist">
                <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack}/>
                <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist}/>
              </div>
            </div>
          </div>
      );
  }
};

export default App;