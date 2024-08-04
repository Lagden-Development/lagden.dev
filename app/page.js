// app/page.js
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full text-center px-4">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            We are Lagden Development.
          </h1>
          <p className="text-lg">
            A small development group passionate about open-source.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="text-lg">
            We specialize in multiple kinds of web development, including
            front-end technologies like React, NextJS, and Tailwind; back-end
            technologies like Node.js, Flask, and PHP; and databases like SQL
            and MongoDB. Our team has expertise in Python, Discord.py, Flask,
            Tailwind, NextJS, React, PHP, Java (including Minecraft plugins),
            SQL, and MongoDB, allowing us to deliver comprehensive and robust
            web solutions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/projects/betterqr" passHref>
              <div className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col justify-between h-full">
                <div>
                  <div className="w-full h-40 mb-4 flex items-center justify-center">
                    <Image
                      src="/images/project-betterqr.svg"
                      alt="BetterQR Logo"
                      width={160}
                      height={160}
                      className="object-contain rounded"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">BetterQR</h3>
                  <p className="text-gray-400">
                    The best QR managing service with various features, all for
                    free.
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/projects/rickbot" passHref>
              <div className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col justify-between h-full">
                <div>
                  <div className="w-full h-40 mb-4 flex items-center justify-center">
                    <Image
                      src="/images/project-rickbot.png"
                      alt="RickBot"
                      width={160}
                      height={160}
                      className="object-contain rounded"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">RickBot</h3>
                  <p className="text-gray-400">
                    An advanced framework for quickly creating Discord bots with
                    discord.py.
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/projects/flask-obfuscate" passHref>
              <div className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col justify-between h-full">
                <div>
                  <div className="w-full h-40 mb-4 flex items-center justify-center">
                    <Image
                      src="/images/lagden_dev_logo.png"
                      alt="Project 3"
                      width={160}
                      height={160}
                      className="object-contain rounded"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Flask-Obfuscate</h3>
                  <p className="text-gray-400">
                    A Flask extension to obfuscate HTML responses.
                  </p>
                </div>
              </div>
            </Link>
          </div>
          <Link href="/projects" passHref>
            <p className="text-gray-400 mt-4 cursor-pointer hover:underline">
              View all projects
            </p>
          </Link>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-lg mb-4">
            Get in touch with us through Email or GitHub.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="mailto:contact@lagden.dev" className="underline">
              Email
            </a>
            <a
              href="https://github.com/Lagden-Development"
              target="_blank"
              className="underline"
            >
              GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
