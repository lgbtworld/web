import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import MatchScreen from '../src/components/MatchScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/match'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <MatchScreen />
    </SSRPage>
  );
}
