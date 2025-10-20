import 'dotenv/config'
import pool from '../database/connection'

console.log('DATABASE_URL:', process.env.DATABASE_URL)

const sampleProjects = [
  {
    title: 'Meu portfólio Atual',
    description: 'Meu portfólio atual, lugar onde coloco todos meus projetos pessoais e profissionais',
    img: '/sandrofernandes.png',
    repo: 'https://github.com/SandroFernandesRosal/my-portfolio-next',
    page: 'https://sandrofernandes-dev.vercel.app/',
    slug: 'meu-portfolio-atual',
    featured: true,
    technologies: ['HTML', 'CSS', 'JS', 'TS', 'React', 'Next', 'Tailwind'],
    images: []
  },
  {
    title: 'Card Perfil',
    description: 'Card de acesso rápido as minhas redes. Feito para testar o aprendizado em Angular',
    img: '/card-perfil.png',
    repo: 'https://github.com/SandroFernandesRosal/cardPerfil-angular',
    page: 'https://card-perfil-sandrofernandes.vercel.app/',
    slug: 'card-perfil',
    featured: true,
    technologies: ['HTML', 'CSS', 'JS', 'TS', 'Angular'],
    images: []
  },
  {
    title: 'MyStore',
    description: 'Pequena loja virtual, para por em prática o aprendizado',
    img: '/mystore.png',
    repo: 'https://github.com/SandroFernandesRosal/mystore',
    page: 'https://mystore-dev.vercel.app/',
    slug: 'mystore',
    featured: false,
    technologies: ['HTML', 'CSS', 'JS', 'TS', 'React', 'Next', 'Tailwind'],
    images: []
  },
  {
    title: 'Alcançados pela Graça',
    description: 'Site oficial da igreja Alcançados pela Graça. Site Fullstack, com Api sendo desenvolvida com NodeJS em Typescript',
    img: '/alcancadospelagraca.png',
    repo: 'https://github.com/SandroFernandesRosal/igreja-app',
    page: 'https://alcancadospelagraca.vercel.app/',
    slug: 'alcancados-pela-graca',
    featured: true,
    technologies: ['HTML', 'CSS', 'JS', 'React', 'Next', 'Tailwind', 'Zustand', 'API'],
    images: []
  },
  {
    title: 'Portfólio de Elisa Rosal',
    description: 'Projeto de Elisa Rosal',
    img: '/elisarosal.png',
    repo: 'https://github.com/SandroFernandesRosal/portfolio-elisa',
    page: 'https://elisarosal.vercel.app/',
    slug: 'portfolio-elisa-rosal',
    featured: false,
    technologies: ['HTML', 'CSS', 'JS', 'React', 'Next', 'Tailwind'],
    images: []
  },
  {
    title: 'Loja de Quadrinho da Marvel',
    description: 'Projeto de desafio para um vaga front-end',
    img: '/marvel-heroes.png',
    repo: 'https://github.com/SandroFernandesRosal/marvel-app',
    page: 'https://marvel-heroes-app.netlify.app/',
    slug: 'marvel-heroes',
    featured: false,
    technologies: ['HTML', 'CSS', 'JS', 'React'],
    images: []
  },
  {
    title: 'MyNotes',
    description: 'Projeto da Rocketseat, para aprendizado. Site Fullstack, com Api desenvolvida em NodeJS',
    img: '/minhasnotas.png',
    repo: 'https://github.com/SandroFernandesRosal/myNotes-front-end',
    page: 'https://my-notes-front-end.vercel.app/',
    slug: 'mynotes',
    featured: false,
    technologies: ['HTML', 'CSS', 'JS', 'React', 'Styled Components'],
    images: []
  },
  {
    title: 'Meu Portfólio react',
    description: 'Projeto feito em ReactJS. Espaço onde coloco meus projetos.',
    img: '/portfolio-novo.png',
    repo: 'https://github.com/SandroFernandesRosal/Portf-lio-ReactJS',
    page: 'https://sandrofernandesdev.netlify.app/',
    slug: 'portfolio-react',
    featured: false,
    technologies: ['HTML', 'CSS', 'JS', 'React'],
    images: []
  },
  {
    title: 'RPZ FC - Time de futebol amador',
    description: 'Projeto feito em ReactJS. Site para um time de futebol amador.',
    img: '/rpz-novo.png',
    repo: 'https://github.com/SandroFernandesRosal/RPZFC-ReactJS',
    page: 'https://rpzfc.netlify.app/',
    slug: 'rpz-fc',
    featured: false,
    technologies: ['HTML', 'CSS', 'JS', 'React'],
    images: []
  },
  {
    title: 'Meu primeiro potfólio',
    description: 'Projeto feito com HTML e CSS. Esse foi meu primeiro portfólio, feito em 2020 e atualizado até o início de 2022.',
    img: '/portfolio-antigo.png',
    repo: 'https://github.com/SandroFernandesRosal/Sandro-Fernandes',
    page: 'https://sandrofernandesrosal.github.io/Sandro-Fernandes',
    slug: 'portfolio-antigo',
    featured: false,
    technologies: ['HTML', 'CSS'],
    images: []
  },
  {
    title: 'RPZ FC - site antigo',
    description: 'Projeto feito em HTML, CSS e Javascript. Esse projeto foi feito em 2022 e atualizado até 05/2022',
    img: '/rpz-antigo.png',
    repo: 'https://github.com/SandroFernandesRosal/RPZFC',
    page: 'https://sandrofernandesrosal.github.io/RPZFC/',
    slug: 'rpz-fc-antigo',
    featured: false,
    technologies: ['HTML', 'CSS', 'JS'],
    images: []
  }
]

async function seed() {
  const client = await pool.connect()
  
  try {
    console.log('🌱 Iniciando seed do banco de dados...')
    
    // Clear existing data
    await client.query('DELETE FROM project_images')
    await client.query('DELETE FROM project_technologies')
    await client.query('DELETE FROM projects')
    await client.query('DELETE FROM technologies')
    
    console.log('🗑️ Dados antigos removidos')
    
    // Insert technologies
    const technologies = [
      'HTML', 'CSS', 'JS', 'TS', 'React', 'Next', 'Tailwind',
      'Angular', 'Node.js', 'API', 'Styled Components', 'Prisma',
      'MySQL', 'PostgreSQL', 'Supabase', 'OpenAI', 'Z-API',
      'Scrum', 'Kanban', 'Zustand'
    ]
    
    for (const tech of technologies) {
      await client.query('INSERT INTO technologies (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [tech])
    }
    
    console.log('🔧 Tecnologias inseridas')
    
    // Insert projects
    for (const project of sampleProjects) {
      await client.query('BEGIN')
      
      try {
        // Insert project
        const projectResult = await client.query(`
          INSERT INTO projects (title, description, img, repo, page, slug, featured)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          project.title,
          project.description,
          project.img,
          project.repo,
          project.page,
          project.slug,
          project.featured
        ])
        
        const projectId = projectResult.rows[0].id
        
        // Link technologies
        for (const techName of project.technologies) {
          const techResult = await client.query('SELECT id FROM technologies WHERE name = $1', [techName])
          if (techResult.rows.length > 0) {
            const techId = techResult.rows[0].id
            await client.query(
              'INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2)',
              [projectId, techId]
            )
          }
        }
        
        // Insert images
        for (const imageUrl of project.images) {
          await client.query(
            'INSERT INTO project_images (url, project_id) VALUES ($1, $2)',
            [imageUrl, projectId]
          )
        }
        
        await client.query('COMMIT')
        console.log(`✅ Projeto "${project.title}" inserido`)
        
      } catch (error) {
        await client.query('ROLLBACK')
        console.error(`❌ Erro ao inserir projeto "${project.title}":`, error)
      }
    }
    
    console.log('🎉 Seed concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
