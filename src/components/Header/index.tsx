import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  const router = useRouter();
  function handleClick(): void {
    router.push('/', '', {});
  }

  return (
    <div className={styles.content}>
      <Image
        src="/Logo.svg"
        width={238.62}
        height={25.63}
        alt="logo"
        onClick={() => handleClick()}
      />
    </div>
  );
}
