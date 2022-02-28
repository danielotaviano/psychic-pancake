import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.container} key={post?.uid}>
      <div className={styles.banner}>
        <img src={post?.data.banner.url} alt={post?.data.title} />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>{post?.data.title}</h1>
        <div className={styles.info}>
          <time>
            <FiCalendar />
            {format(new Date(post?.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <span>
            <FiUser />
            {post?.data.author}
          </span>
          <span>
            <FiClock />
            {4} min
          </span>
        </div>
        <section>
          {post?.data.content.map(({ heading, body }) => (
            <div key={heading}>
              <h2 className={styles.heading}>{heading}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
              />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post')
  );

  return {
    fallback: true,
    paths: [
      ...posts.results.map(post => ({
        params: {
          slug: post.uid,
        },
      })),
    ],
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', slug as string, {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body,
      })),
      subtitle: response.data.subtitle,
    },
  };

  return {
    props: { post },
  };
};
