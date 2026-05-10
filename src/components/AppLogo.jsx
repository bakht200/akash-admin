import logo from '../assets/logo-akash.png'

export default function AppLogo({ className = '' }) {
  return <img src={logo} alt="Akash" className={`block ${className}`} decoding="async" />
}
