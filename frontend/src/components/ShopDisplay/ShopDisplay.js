import React, { Component } from 'react';

import './ShopDisplay.css';

import ShopItem from '../ShopItem/ShopItem';

class ShopDisplay extends Component {
  constructor(props) {
    console.log('Constructing Shop Display ...');
    super(props);
    console.log(this);
    this.state = {
      filter: this.pathNameToTitle(),
      data: []
    }
  }

  pathNameToTitle () {
    if (this.props.location.pathname.includes('nearby')) {
      return "Nearby"
    } else if (this.props.location.pathname.includes('preferred')) {
      return "Preferred";
    } else {
      return "";
    }
  }

  handleItemUnmount (id) {
    console.log(`Removing item ${id}`);
    let res = this.state.data.filter (item => {
      return item.props.id !== id;
    });
    this.setState({
      ... this.state,
      data: res
    })
  }

  componentDidMount() {
    this.refreshShops(this.props.location.pathname);
    this.props.history.listen((location, action) => {
      this.refreshShops(location.pathname);
    });
  }

  fetchShops (url,x,y) {
    let shops = [];
    let isPreferred = !url.includes('nearby');
    fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then ( (resp) =>  resp.json() )
    .then ( (data) => {
      console.log(data);
      for (let s of data) {
        shops.push (<ShopItem key={s._id} id={s._id} name={s.name} img={s.picture} preferred={isPreferred} selfUnmount={this.handleItemUnmount.bind(this)}/>);
      }

      this.setState( {
        filter: this.pathNameToTitle(),
        data: shops
      });

    })
    .catch( (err) => {
      console.error(err);
    });
  }

  refreshShops (mode) {
    let shops = [];
    let url = "";
        if (mode === '/shops/nearby') {
          console.log('nearby');

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition( (position) => {
              console.log(position.coords.longitude, position.coords.latitude);
              url = `http://localhost:3000/api/v1/shops/nearby?x=${position.coords.longitude}&y=${position.coords.longitude}`;
              this.fetchShops(url);
            }, (err) => {
              console.log('No permission for geolocation.');
              url = `http://localhost:3000/api/v1/shops/nearby`;
              this.fetchShops(url);
            });
          } else {
            console.log("Geolocation is not supported.");
            url = `http://localhost:3000/api/v1/shops/nearby`;
            this.fetchShops(url);
          }

        } else if (mode === '/shops/preferred') {
          console.log('preferred');
          url = 'http://localhost:3000/api/v1/users/shops/liked';
          this.fetchShops(url);
        }
  }

  render() {
    return (
      <div className="ShopDisplay">
        <div>
          <h1>{`${this.state.filter} Shops`}</h1>
        </div>
        <div>
          { this.state.data  }
        </div>
      </div>
    );
  }
}

export default ShopDisplay;
