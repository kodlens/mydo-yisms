<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Str;


class FileMover {

    public function __construct(
        private readonly object $user,
        string $disk = 'public'
    ) {
        $this->storage = Storage::disk($disk);
    }

    public function moveFromTemp(array $files): array {
        $results = [];

        $userDirectory = $this->getUserDirectory();
        $directory = "upfiles/{$userDirectory}";


        $this->storage->makeDirectory($directory);


        foreach ($files as $type => $fileName) {

            if (empty($fileName)) {
                continue;
            }

            $fileName = basename($fileName);

            // Sanitize document type
            $type = strtolower(
                preg_replace('/[^a-zA-Z0-9_-]/', '', $type)
            );

            // Add document type as prefix
            $newFileName = "{$type}_{$fileName}";

            $source = "temp/{$fileName}";
            $destination = "{$directory}/{$newFileName}";

            if (!$this->storage->exists($source)) {
                $results[$type] = [
                    'is_moved' => false,
                    'dir' => null,
                    'filename' => null,
                    'path' => null,
                ];

                continue;
            }

            $moved = $this->storage->move(
                $source,
                $destination
            );

            $results[$type] = [
                'is_moved' => $moved,
                'dir' => $userDirectory,
                'filename' => $fileName,
                'path' => $moved ? $destination : null,
            ];
        }

        return $results;

    }


    private function getUserDirectory(): string
    {
        $id = $this->user->id;

        $firstName = $this->user->fname ?? 'X';
        $lastName = $this->user->lname ?? 'X';

        $name = mb_substr($firstName, 0, 1) . $lastName;

        $name = strtoupper(
            Str::slug($name, '')
        );

        return "{$id}_{$name}";
    }

}
