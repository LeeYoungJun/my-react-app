import PropTypes from 'prop-types'
import './HelloWorld.css'

function HelloWorld({ name = 'World' }) {
  return (
    <div className="hello-world">
      <h2>
        Hello,
        {name}
        !
      </h2>
    </div>
  )
}

HelloWorld.propTypes = {
  name: PropTypes.string,
}

HelloWorld.defaultProps = {
  name: 'World',
}

export default HelloWorld
