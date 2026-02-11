import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {

    super(props)

    this.state = {
      hasError: false
    }
  }

  static getDerivedStateFromError (error) {

    return {
      hasError: true
    }
  }

  render() {
    if(this.state.hasError) {
      return (<h1 className="flex justify-center items-center    
        h-screen">
        Something went wrong
        </h1>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary