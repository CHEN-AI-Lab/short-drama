import { Component, type ReactNode } from 'react'
import './app.scss'

class App extends Component<{ children: ReactNode }> {
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
