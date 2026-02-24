import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import ProfileScreen from '../src/components/ProfileScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/profile'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <ProfileScreen />
    </SSRPage>
  );
}
