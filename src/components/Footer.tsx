export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="site-footer-brand">© {new Date().getFullYear()} LooBites</div>
        <div className="site-footer-links">
          <a href="#">Privacy</a>
          <span aria-hidden="true">•</span>
          <a href="#">Terms</a>
          <span aria-hidden="true">•</span>
          <a href="#">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
