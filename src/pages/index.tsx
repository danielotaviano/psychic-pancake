import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';

import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const formatedPublicationDate = (date: string | null): string => {
    if (date) {
      return format(new Date(date), 'dd MMM yyyy', {
        locale: ptBR,
      });
    }

    return '';
  };

  function postsMap(post: Post): JSX.Element {
    return (
      <Link href={`/post/${post.uid}`} key={post.uid}>
        <a className={styles.post}>
          <h1>{post.data.title}</h1>
          <h2>{post.data.subtitle}</h2>
          <div className={styles.info}>
            <time>
              <FiCalendar />
              {formatedPublicationDate(post.first_publication_date)}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
          </div>
        </a>
      </Link>
    );
  }

  async function handleNextPage(): Promise<void> {
    if (postsPagination.next_page) {
      const postsResponse = await fetch(postsPagination.next_page).then(
        response => response.json()
      );

      const formattedPosts: Post[] = postsResponse.results.map(post => ({
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data,
      }));

      setPosts([...posts, ...formattedPosts]);
      setNextPage(postsResponse.next_page);
    }
  }

  return (
    <div className={styles.container}>
      {posts.map(postsMap)}
      {nextPage && (
        <button type="button" onClick={handleNextPage}>
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    { pageSize: 1 }
  );

  const posts: Post[] = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: post.data,
  }));

  return {
    props: {
      postsPagination: { results: posts, next_page: postsResponse.next_page },
    },
  };
};
