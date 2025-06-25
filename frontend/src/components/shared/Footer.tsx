const Footer = () => {
    return (
      <footer className="w-full mt-24">
        <div className="container mx-auto px-6 py-8 text-center text-foreground/60 glass-card rounded-t-2xl">
          <p>&copy; {new Date().getFullYear()} ArtGen. All rights reserved.</p>
          <p className="text-sm mt-2">Create, Inspire, Innovate</p>
        </div>
      </footer>
    );
  };
  
  export default Footer; 