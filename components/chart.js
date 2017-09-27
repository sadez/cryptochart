import { withParentSize } from '@vx/responsive';
import { scaleTime , scaleLinear } from '@vx/scale';
import { LinePath ,AreaClosed ,Bar ,Line} from '@vx/shape';
import { LinearGradient  } from '@vx/gradient';
import { AxisBottom  } from '@vx/axis';
import { localPoint  } from '@vx/event';
import { withTooltip , Tooltip } from '@vx/tooltip';
import { bisector } from 'd3-array';
import { Motion, spring } from 'react-motion'
import formatPrice  from '../utils/formatPrice';
import formatDate  from '../utils/formatDate';
import MaxPrice from './maxprice'
import MinPrice from './minprice'

class Chart extends React.Component {
  constructor(props){
    super(props);

  }
  render(){
    const {
      data ,
      parentWidth,
      parentHeight,
      tooltipLeft,
      tooltipTop,
      tooltipData,
      showTooltip,
      hideTooltip
    } = this.props;
    const margin = {
      top: 15,
      bottom: 40,
      left: 0,
      right: 0
    };

    const width = parentWidth - margin.left - margin.right;
    const height = parentHeight - margin.top - margin.bottom;
    //console.log(withParentSize);
    const bitsectDate = bisector(d => x(d)).left;

    const x = d => new Date(d.time);
    const y = d => d.price;

    const firstPoint = data[0];
    const currentPoint = data[data.length-1];

    const minPrice = Math.min(...data.map(y));
    const maxPrice = Math.max(...data.map(y));
    const maxPriceData =[
      {
        time: x(firstPoint),
        price: maxPrice
      },
      {
        time: x(currentPoint),
        price: maxPrice
      }
    ];
    const minPriceData =[
      {
        time: x(firstPoint),
        price: minPrice
      },
      {
        time: x(currentPoint),
        price: minPrice
      }
    ];


    const xScale = scaleTime({
      range: [0,width],
      domain:[Math.min(...data.map(x)),Math.max(...data.map(x))]
    });

    const yScale = scaleLinear({
      range: [height,0],
      domain:[Math.min(...data.map(y)),Math.max(...data.map(y))]
    });

    var findYatXbyBisection = function(x, path, error){
      var length_end = path.getTotalLength()
        , length_start = 0
        , point = path.getPointAtLength((length_end + length_start) / 2) // get the middle point
        , bisection_iterations_max = 50
        , bisection_iterations = 0

      error = error || 0.01

      while (x < point.x - error || x > point.x + error) {
        // get the middle point
        point = path.getPointAtLength((length_end + length_start) / 2)

        if (x < point.x) {
          length_end = (length_start + length_end)/2
        } else {
          length_start = (length_start + length_end)/2
        }

        // Increase iteration
        if(bisection_iterations_max < ++ bisection_iterations)
          break;
      }
      return point.y
    }


    return (
      <div>
        <svg ref={s=> (this.svg = s)} width={width} height={parentHeight}>
          <AxisBottom
            top={yScale(minPrice)-10}
            data={data}
            scale={xScale}
            x={x}
            hideAxisLine
            hideTicks
            numTicks={3}
            tickLabelProps ={({ tick, index }) => ({
              dy: '0.25em',
              fill: '#ffffff',
              fontSize: 11
            })}
            />
          <LinearGradient
            id="area-fill"
            from='#4682b4'
            to='#4682b4'
            fromOpacity={0.3}
            toOpacity={0}/>
          <MaxPrice data={maxPriceData}
            yScale={yScale}
            xScale={xScale}
            x={x}
            y={y}
            label={formatPrice(maxPrice)}
            yText={yScale(maxPrice)}/>
          <MinPrice data={minPriceData}
            yScale={yScale}
            xScale={xScale}
            x={x}
            y={y}
            label={formatPrice(minPrice)}
            yText={yScale(minPrice)}/>
          <AreaClosed
            data={data}
            yScale={yScale}
            xScale={xScale}
            x={x}
            y={y}
            fill="url(#area-fill)"
            stroke="transparent"
            />
          <LinePath id="LinePath1"
            data={data}
            yScale={yScale}
            xScale={xScale}
            x={x}
            y={y}/>
          <Bar data={data} width={width} height={height} fill="transparent"
            onMouseMove={data => event => {
              const{ x: xPoint } = localPoint(this.svg , event);
              const x0 = xScale.invert(xPoint);
              const index = bitsectDate(data,x0,1);
              const d0 = data[index-1];
              const d1 = data[index];
              const d = x0 - xScale(x(d0)) > xScale(x(d1)) - x0 ? d1 : d0;
              showTooltip({
                tooltipLeft: xScale(x(d)),
                tooltipTop: yScale(y(d)),
                tooltipData: d
              });
            }}
            onMouseLeave={data => event => hideTooltip()} >
          </Bar>
          {tooltipData &&
            <g>
              <Motion
                defaultStyle={{ opacity: 0, x: tooltipLeft }}
                style={{
                  x: spring(tooltipLeft)
                }}>
                {style => (

                  //console.log(tooltipLeft),
                  //let y = findYatXbyBisection(style.x,document.getElementById('LinePath1'),0.01),
                        <g>
                          <circle
                            r="4"
                            cx={style.x}
                            cy={findYatXbyBisection(style.x,document.getElementById('LinePath1'),0.01)}
                            fill="#00f1a1"
                            style={{ pointerEvents : 'none'}}
                            />
                          <circle
                            r="8"
                            cx={style.x}
                            cy={findYatXbyBisection(style.x,document.getElementById('LinePath1'),0.01)}
                            fill="#00f1a1"
                            fillOpacity={0.4}
                            style={{ pointerEvents : 'none'}}
                            />
                        </g>
                )}
              </Motion>
              <Line
                from={{
                  x : tooltipLeft ,
                  y : yScale(y(maxPriceData[0]))
                }}
                to={{
                  x : tooltipLeft ,
                  y : yScale(y(minPriceData[0]))
                }}
                stroke = "#ffffff"
                strokeDasharray="2.2"
                />
              { /* <circle
                r="4"
                cx={tooltipLeft}
                cy={tooltipTop}
                fill="#00f1a1"
                style={{ pointerEvents : 'none'}}
                />
              <circle
                r="8"
                cx={tooltipLeft}
                cy={tooltipTop}
                fill="#00f1a1"
                fillOpacity={0.4}
                style={{ pointerEvents : 'none'}}
                />*/}
            </g>}
          </svg>
          {tooltipData &&
            <Tooltip
              top={tooltipTop -12}
              left={tooltipLeft +12}
              style={{
                backgroundColor : "#6086d6",
                color : "#ffffff"
              }}
              >  {formatPrice(y(tooltipData))}</Tooltip>
          }
          {tooltipData &&
            <Tooltip
              top={yScale(minPrice)}
              left={tooltipLeft +12}
              style={{
                transform: 'translateX(-50%)'
              }}
              >  {formatDate(x(tooltipData))}</Tooltip>
          }
        </div>
      );
    }
  }


  export default withParentSize(withTooltip(Chart));
