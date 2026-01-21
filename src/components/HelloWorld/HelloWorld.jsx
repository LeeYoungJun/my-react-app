import './HelloWorld.css'

function HelloWorld({ name = 'World' }) {
  return (
    <div className="hello-world">
      <h2>Hello, {name}!</h2>
    </div>
  )
}

export default HelloWorld
