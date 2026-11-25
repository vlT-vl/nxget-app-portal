import '../css/docpage.css'

const DocPage = ({ eyebrow, title, lead = [], visual, groups, footer }) => (
  <section className="doc">
    <header className="doc-head">
      <span className="doc-eyebrow">{eyebrow}</span>
      <h1 className="doc-title title-shine title-shine--now">{title}</h1>
      {lead.map(p => (
        <p key={p} className="doc-lead">{p}</p>
      ))}
    </header>

    {visual}

    {groups.map(group => (
      <div key={group.title} className="doc-group">
        <header className="doc-group-head rv">
          <h2 className="doc-group-title">{group.title}</h2>
          {group.subtitle && <p className="doc-group-sub">{group.subtitle}</p>}
        </header>

        <div className="doc-body">
          {group.items.map((item, i) => (
            <article key={item.title} className="doc-sec rv">
              {group.icons?.[i] && (() => {
                const Icon = group.icons[i]
                return (
                  <span className="doc-icon" aria-hidden="true">
                    <svg className="doc-shape" viewBox="0 0 64 64">
                      <circle className="doc-shape-orbit" cx="32" cy="32" r="30.5" pathLength="1" />
                      <polygon className="doc-shape-fill" points="32,5 59,32 32,59 5,32" />
                      <polygon className="doc-shape-line" points="32,5 59,32 32,59 5,32" pathLength="1" />
                    </svg>
                    <Icon className="doc-glyph" />
                  </span>
                )
              })()}
              <div className="doc-sec-main">
                <div className="doc-sec-top">
                  <span className="doc-num">{String(i + 1).padStart(2, '0')}</span>
                  {item.badge && <span className={`doc-badge doc-badge--${item.badge.state}`}>{item.badge.label}</span>}
                </div>
                <h3 className="doc-sec-title">{item.title}</h3>
                <p className="doc-text">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    ))}

    {footer && (
      <div className="doc-foot rv">
        <div>
          <span className="doc-foot-label">{footer.label}</span>
          <strong className="doc-foot-text">{footer.text}</strong>
        </div>
        {footer.href ? (
          <a className="doc-btn btn-shine" href={footer.href} target="_blank" rel="noopener noreferrer">
            {footer.icon} {footer.cta}
          </a>
        ) : (
          <button type="button" className="doc-btn btn-shine" onClick={footer.onClick}>
            {footer.cta} {footer.icon}
          </button>
        )}
      </div>
    )}
  </section>
)

export default DocPage
