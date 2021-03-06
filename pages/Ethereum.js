import React, { Component } from 'react';
import { withScreenSize } from '@vx/responsive';
import { LinearGradient  } from '@vx/gradient';
import Chart from '../components/chart';
import formatPrice  from '../utils/formatPrice';



function Background ({ width,height }){
  return (
    <svg width={width} height={height}>
      <LinearGradient id="fill" from='#a18cd1'  to='#fbc2eb'></LinearGradient>
      <rect width={width} height={height} fill="url(#fill)"/>
    </svg>
  );
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      data:{}
    };
  }

  componentDidMount() {
    fetch('https://etherchain.org/api/statistics/price')
    .then(res => res.json())
    .then(json => {
      this.setState({
        data :json
      });
    });
  }

  render(){
    const {screenWidth , screenHeight} = this.props;
    const {data} = this.state;
    //console.log(data);
    if (!data.data) {
      return(<div className='app'>
        <Background width={screenWidth} height={screenHeight}/>
        <div className="center">
          <div className="chart">
            <div className="titlebar">
              <div className="title">
                <div>Ethereum Price</div>
                <div className="duration">
                  <small>Last 30 days</small>
                </div>
              </div>
              <div className="spacer"></div>
              <div className="prices">
              </div>
            </div>
            <div className="container">
            </div>
          </div>
          <p className="disclaimer">{data.disclaimer}</p>
        </div>
        <style jsx>{`
            .app,
            .center{
              display: flex;
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              flex: 1;
              justify-content: center;
              align-items: center;
              font-family: arial;
              flex-direction: column;
            }
            .duration{
              color : #6086d6;
              font-size: 14px;
            }
            .prices{
              align-items: flex-end;
              display: flex;
              flex-direction: column;
            }
            .decreased{
              color: #e1191d;
            }
            .increased{
              color: #00f1a1;
            }
            .container{
              flex: 1;
              display: flex;
            }
            .spacer{
              flex:1;
            }
            .titlebar{
              display: flex;
              flex-direction: row;
              align-items:center;
              padding: 15px;
            }
            .chart{
              width: 600px;
              height: 400px;
              background-color: #27273f;
              border-radius: 8px;
              color: white;
              display: flex;
              flex-direction: column;
            }
            .disclaimer{
              opacity: 0.8;
              color: grey;
              font-size: 11px;
            }


            `}</style>
        </div>
      )
    }
    const prices = Object.keys(data.data).filter(k => {
      //console.log(data.data[k].time);
      let date = new Date(data.data[k].time);
      //console.log(date.getHours());
      return date.getHours()=== 0;
    }).slice(-30).map(k => {
        return {
          time: data.data[k].time,
          price: data.data[k].usd
        }
    });

    //console.log(prices);


    const firstPrice = prices[0].price;
    const currentPrice = prices[prices.length -1].price;
    const diffPrice = currentPrice - firstPrice;
    const hasIncreased = diffPrice > 0 ;

    return(
      <div className='app'>
        <Background width={screenWidth} height={screenHeight}/>
        <div className="center">
          <div className="chart">
            <div className="titlebar">
              <div className="title">
                <div>Ethereum Price</div>
                <div className="duration">
                  <small>Last 30 days</small>
                </div>
              </div>
              <div className="spacer"></div>
              <div className="prices">
                <div>
                  {formatPrice(currentPrice)}
                </div>
                <div className={hasIncreased ? 'increased' : 'decreased'}>
                  <small>
                    {hasIncreased ? '+' : ''}{formatPrice(diffPrice)}
                  </small>
                </div>
              </div>
            </div>

            <div className="container">
              <Chart data={prices}/>
            </div>
          </div>

          <p className="disclaimer">{data.disclaimer}</p>
        </div>
        <style jsx>{`
            .app,
            .center{
              display: flex;
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              flex: 1;
              justify-content: center;
              align-items: center;
              font-family: arial;
              flex-direction: column;
            }
            .duration{
              color : #6086d6;
              font-size: 14px;
            }
            .prices{
              align-items: flex-end;
              display: flex;
              flex-direction: column;
            }
            .decreased{
              color: #e1191d;
            }
            .increased{
              color: #00f1a1;
            }
            .container{
              flex: 1;
              display: flex;
            }
            .spacer{
              flex:1;
            }
            .titlebar{
              display: flex;
              flex-direction: row;
              align-items:center;
              padding: 15px;
            }
            .chart{
              width: 600px;
              height: 400px;
              background-color: #27273f;
              border-radius: 8px;
              color: white;
              display: flex;
              flex-direction: column;
            }
            .disclaimer{
              opacity: 0.8;
              color: grey;
              font-size: 11px;
            }


            `}</style>
        </div>
      );
    }
  }

  export default withScreenSize(App);
