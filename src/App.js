import React, { PureComponent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { login, countersCollection } from './realm'

import './App.css'

class App extends PureComponent {
  state = {
    uuid: uuidv4(),
    user: null,
    isRunning: false,
    values: []
  }

  componentDidMount() {
    const { uuid } = this.state
    const start = async () => {
      // Initiate login
      const user = await login()
      this.setState({ user })

      // Start watch on uuid
      const stream = await countersCollection.watch({ 'fullDocument.uuid': uuid })
      stream.onNext((event) => {
        if (event.operationType === 'insert' && event.fullDocument) {
          this.setState({
            values: [{ date: new Date(), counter: event.fullDocument.value }, ...this.state.values]
          })
        }
        if (event.operationType === 'update' && event.fullDocument) {
          this.setState({
            values: [{ date: new Date(), counter: event.fullDocument.value }, ...this.state.values]
          })
        }

        // Stop at 360 (360 = 3 minutes)
        if (this.state.values.length === 360) {
          this.setState({ isRunning: false })
          clearInterval(this.interval)
        }
      })

      // Start counter (update every 0.5 second)
      this.interval = setInterval(() => {
        const query = { uuid }
        const update = {
          $set: { uuid },
          $inc: { value: 0.5 }
        }
        const options = { upsert: true }
        countersCollection.updateOne(query, update, options)
      }, 500)

      this.setState({ isRunning: true })
    }

    // Start login and counter
    start()
  }

  render() {
    const { uuid, user, values, isRunning } = this.state

    if (!user) {
      return null
    }

    let status
    if (isRunning) {
      status = 'Running'
    } else if (values.length === 0) {
      status = 'Not started'
    } else if (values.length === 360) {
      status = 'Successfully processed 360 watch examples in 3 minutes (2 per second)'
    } else {
      status = `Failed processing 360 watch examples (processed ${values.length})`
    }

    return (
      <div className="App">
        <header className="App-header">
          <p>Status: {status}</p>
          <p>
            UUID: {uuid}
          </p>
          {values.map((value, index) => (
            <p key={index}>{value.date.toISOString()}: {value.counter}</p>
          ))}
        </header>
      </div>
    )
  }
}

export default App
