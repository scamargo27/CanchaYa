import { connect } from 'react-redux';
import backgroundImg from '../../assets/img/background.png';


function Layout({ children }) {
  // Para el ejemplo, usamos una imagen de placeholder
  // En tu proyecto real, descomenta la línea de arriba
  
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Imagen de fondo fija con parallax effect */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay gradiente para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/65 to-white/75 backdrop-blur-[2px]"></div>
        
        {/* Overlay con patrón opcional para textura */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0,0,0,0.03) 10px,
              rgba(0,0,0,0.03) 20px
            )`
          }}
        ></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(Layout);