import * as React from 'react'
import * as _ from 'lodash'
import {observer} from 'mobx-react'
import {computed, action, observable} from 'mobx'
import ChartConfig from './ChartConfig'
import Bounds from './Bounds'
import {DataKeyInfo} from './ChartData'
const Fuse = require("fuse.js")
const styles = require("./DataSelector.css")
import * as d3 from 'd3'
import ChartView from './ChartView'

@observer
export class DataSelectorMulti extends React.Component<{ chart: ChartConfig, chartView: ChartView, onDismiss: () => void }> {
    @observable searchInput?: string
    searchField: HTMLInputElement
    base: HTMLDivElement

    @computed get availableData(): DataKeyInfo[] {
        const {chart} = this.props
        return chart.data.availableKeys.map(key => chart.data.lookupKey(key))
    }
    
    @computed get selectedData() {
        return this.availableData.filter(d => this.props.chart.data.selectedKeysByKey[d.key])
    }

    @computed get unselectedData() {
        return this.availableData.filter(d => !this.props.chart.data.selectedKeysByKey[d.key])
    }
    @computed get fuseSearch(): any {
        return new Fuse(this.unselectedData, {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ["label"]
        });
    }

    @computed get searchResults(): DataKeyInfo[] {
        return this.searchInput ? this.fuseSearch.search(this.searchInput) : this.unselectedData
    }

    componentWillMount() {
    }

    @action.bound onClickOutside(e: MouseEvent) {
        if (this.base && !this.base.contains(e.target as Node))
            this.props.onDismiss()
    }

    componentDidMount() {
        setTimeout(() => document.addEventListener("click", this.onClickOutside), 1)
        if (!this.props.chartView.isMobile)
            this.searchField.focus()
    }

    componentDidUnmount() {
        document.removeEventListener("click", this.onClickOutside)
    }

    @action.bound onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key == "Enter" && this.searchResults.length > 0) {
            this.props.chart.data.toggleKey(this.searchResults[0].key)
            this.searchInput = ""
        } else if (e.key == "Escape")
            this.props.onDismiss()
    }

    render() {
        const {chart} = this.props
        const {selectedData, searchResults, searchInput} = this

        return <div className={styles.DataSelectorMulti} onClick={e => e.stopPropagation()}>
            <h2>Choose data to show <button onClick={this.props.onDismiss}><i className="fa fa-times"/></button></h2>
            <div>
                <div className="searchResults">
                    <input type="search" placeholder="Search..." value={searchInput} onInput={e => this.searchInput = e.currentTarget.value} onKeyDown={this.onSearchKeyDown} ref={e => this.searchField = (e as HTMLInputElement)}/>
                    <ul>
                        {searchResults.map(d => {
                            return <li>
                                <label className="clickable">
                                    <input type="checkbox" checked={!!chart.data.selectedKeysByKey[d.key]} onChange={e => chart.data.toggleKey(d.key)}/> {d.label}
                                </label>
                            </li>
                        })}
                    </ul>
                </div>
                <div className="selectedData">
                    <ul>
                        {selectedData.map(d => {
                            return <li>
                                <label className="clickable">
                                    <input type="checkbox" checked={!!chart.data.selectedKeysByKey[d.key]} onChange={e => chart.data.toggleKey(d.key)}/> {d.label}
                                </label>
                            </li>
                        })}
                    </ul>
                </div>
            </div>
        </div>
    }
}

@observer
export class DataSelectorSingle extends React.Component<{ chart: ChartConfig, chartView: ChartView, onDismiss: () => void }> {
    @observable searchInput?: string
    searchField: HTMLInputElement
    base: HTMLDivElement

    @computed get availableItems() {
        const availableItems: { id: number, label: string }[] = []
        this.props.chart.data.keyData.forEach(meta => {
            availableItems.push({
                id: meta.entityId,
                label: meta.entity
            })
        })
        return _.uniqBy(availableItems, d => d.label)
    }

    @computed get fuseSearch(): any {
        return new Fuse(this.availableItems, {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ["label"]
        });
    }

    @computed get searchResults(): { id: number, label: string }[] {
        return this.searchInput ? this.fuseSearch.search(this.searchInput) : this.availableItems
    }

    @action.bound onClickOutside(e: MouseEvent) {
        if (this.base && !this.base.contains(e.target as Node))
            this.props.onDismiss()
    }

    componentDidMount() {
        setTimeout(() => document.addEventListener("click", this.onClickOutside), 1)
        if (!this.props.chartView.isMobile)
            this.searchField.focus()
    }

    componentDidUnmount() {
        document.removeEventListener("click", this.onClickOutside)
    }

    @action.bound onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key == "Enter" && this.searchResults.length > 0) {
            this.onSelect(this.searchResults[0].id)
            this.searchInput = ""
        } else if (e.key == "Escape")
            this.props.onDismiss()
    }

    @action.bound onSelect(entityId: number) {
        const selectedData = _.cloneDeep(this.props.chart.props.selectedData)
        selectedData.forEach(d => d.entityId = entityId)
        this.props.chart.props.selectedData = selectedData
        this.props.onDismiss()
    }

    render() {
        const {chart} = this.props
        const {searchResults, searchInput} = this

        return <div className={styles.DataSelectorSingle} onClick={e => e.stopPropagation()}>
            <input type="search" placeholder="Search..." value={searchInput} onInput={e => this.searchInput = e.currentTarget.value} onKeyDown={this.onSearchKeyDown} ref={e => this.searchField = (e as HTMLInputElement)}/>
            <ul>
                {searchResults.map(d => {
                    return <li className="clickable" onClick={e => this.onSelect(d.id)}>
                        {d.label}
                    </li>
                })}
            </ul>
        </div>
    }
}

@observer
export default class DataSelector extends React.Component<{ chart: ChartConfig, chartView: ChartView, onDismiss: () => void }> {
    render() {
        const {chart} = this.props

        if (chart.data.canChangeEntity)
            return <DataSelectorSingle {...this.props}/>
        else
            return <DataSelectorMulti {...this.props}/>
    }
}