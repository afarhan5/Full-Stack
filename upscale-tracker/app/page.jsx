import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <span className={styles.tag}>// hello world</span>
        <h1 className={styles.title}>My Next.js App</h1>
        <p className={styles.subtitle}>
          Running on Next.js 14 · Deployed on Vercel
        </p>
        <div className={styles.buttons}>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            Read Docs →
          </a>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            Vercel Dashboard
          </a>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>📁 App Router</h2>
          <p>Using Next.js 14 App Router. Add pages inside the <code>app/</code> folder.</p>
        </div>
        <div className={styles.card}>
          <h2>🎨 Styling</h2>
          <p>CSS Modules included. Add Tailwind, Sass, or any CSS framework you like.</p>
        </div>
        <div className={styles.card}>
          <h2>⚡ Deploy</h2>
          <p>Push to GitHub, connect to Vercel — live in 60 seconds.</p>
        </div>
        <div className={styles.card}>
          <h2>🔑 Env Vars</h2>
          <p>Add secrets in <code>.env.local</code> locally, and in Vercel dashboard for production.</p>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Built with Next.js · Deployed on Vercel</p>
      </footer>
    </main>
  )
}
