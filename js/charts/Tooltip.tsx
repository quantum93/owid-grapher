import * as React from 'react'
import * as ReactDOM from 'react-dom'
import EntityKey from './EntityKey'
import ChartView from './ChartView'
import {computed} from 'mobx'
import {observer} from 'mobx-react'

export interface TooltipDatum {
    entity: EntityKey,
    year: number,
    value: number|string
}

export interface TooltipProps {
    x: number,
    y: number,
    datum: TooltipDatum,
    isFixed: boolean
}


@observer
export default class Tooltip extends React.Component<TooltipProps, undefined> {
    context: { chartView: ChartView }

    @computed get rendered() {
        const {props} = this
        const {datum, isFixed} = props
        const {chartView} = this.context
        const x = props.x*(isFixed ? 1 : chartView.scale)
        const y = props.y*(isFixed ? 1 : chartView.scale)
        
        return <div className="nvtooltip tooltip-xy owid-tooltip" style={{ position: isFixed ? 'fixed' : 'absolute', left: x+'px', top: y+'px' }}>
            <h3>{datum.entity}</h3>
            <p>
                <span>{datum.value}</span><br/>
                in<br/>
                <span>{datum.year}</span>                
            </p>
        </div>
    }

    componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        this.context.chartView.chart.tooltip = this.rendered
    }

    componentWillUnmount() {
        this.context.chartView.chart.tooltip = null
    }
}