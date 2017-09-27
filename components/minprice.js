import { LinePath ,AreaClosed} from '@vx/shape';


export default ({data ,yScale,xScale,yText,label,x,y}) => {
  return (
    <g>
      <LinePath
        data={data}
        yScale={yScale}
        xScale={xScale}
        x={x}
        y={y}
        strokeDasharray='4.4'
        strokeOpacity='0.4'>
      </LinePath>
      <text fill="#6086d6" dy="-.7em" dx="1em" y={yText} fontSize="12">
        {label}
      </text>
    </g>

  );
}
